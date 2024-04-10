// name, password, email
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name:
    {
        type:String,
        required:[true, `Please provide name`],
        minLength:3,
        maxLength:50
    },
    email:
    {
        type:String,
        required:[true, `Please provide email`],
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        `Please provide valid email`],
        unique:true // kreira unique index, nije validator
    },
    password:
    {
        type:String,
        required:[true, `Please provide password`],
        minLength:5
    },
    lastName:
    {
        type:String,
        trim:true,
        maxLength:20,
        default:"lastName"
    },
    location:
    {
        type:String,
        trim:true,
        maxLength:20,
        default:"my city"
    }
    
})

// UserSchema.methods.getName = function()
// {
//     return this.name;
// }

UserSchema.methods.createJWT = function()
{
    return jwt.sign({userId: this._id, name: this.name}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_LIFETIME});
}

UserSchema.methods.comparePassword = async function(candidatePassword)
{
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch; // ovo je omotano u promise
} //(vraca Promise jer je async, koji ce se ispuniti sa true/false);
//Da, točno. Kada definirate funkciju kao async, ona automatski vraća Promise. 
//Sve što vratite iz takve funkcije (kao što je u vašem slučaju isMatch) bit će omotano u Promise.
// Tako da, iako vaša funkcija ne eksplicitno vraća Promise, 
//ona će implicitno vratiti Promise koji će se razriješiti sa vrijednošću koju ste odredili.

UserSchema.pre("save", async function(next) // middleware-scope
{
    if(!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10); // po 2 hesiramo lozinku (kod updateUser)
    this.password = await bcrypt.hash(this.password, salt);
    next();
})
// U Mongoose biblioteci za rad s MongoDB-om,
// "hookovi" su funkcije koje se automatski pozivaju u određenim trenucima tijekom životnog ciklusa dokumenta.
module.exports = mongoose.model("Users", UserSchema);

//Stvaranje jedinstvenog indeksa: Kada definirate polje u Mongoose shemi s unique: true,
// Mongoose automatski kreira jedinstveni indeks za to polje u MongoDB-u kada se stvori kolekcija.
// Ovaj indeks osigurava da se neće dopustiti stvaranje dva dokumenta s istom vrijednošću u tom polju.
//Učinkovitost pretrage: Korištenje jedinstvenih indeksa omogućava MongoDB-u da brzo pretražuje i identificira dokumente s jedinstvenim vrijednostima u tom polju,
// što može poboljšati performanse upita koji koriste to polje za filtriranje podataka.

//Konkretno, "hookovi" u Mongoose-u omogućavaju vam da izvršite određenu logiku prije
// ili nakon određenih operacija, kao što su spremanje (save), 
//ažuriranje (update) ili brisanje (delete) dokumenta iz baze podataka. To vam omogućuje da dodate dodatne funkcionalnosti 
//ili izvršite postupke prije ili nakon standardnih operacija s bazom podataka.