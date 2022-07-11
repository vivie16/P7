module.exports.signUpErrors = (err) => {
    let errors = {pseudo: '', email:'', password:''};

    if(err.message.includes("pseudo"))
        errors.pseudo = "Le pseudo doit avoir entre 3 et 50 caractères";

    if(err.message.includes("email"))
        errors.email = "Email incorrect";

    if(err.message.includes("password"))
        errors.password = "Le mot de passe doit faire 6 carractères minimum";

    if((err.code === 11000 && Object.keys(err.keyValue)[0].includes("email")))
        errors.email = 'Cet email est déjà enregistré';

    if((err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo")))
        errors.pseudo = 'Le pseudo est déjà pris';

    return errors
};

module.exports.signInErrors = (err) => {
    let errors = {email: '', password: ''};

    if(err.message.includes("email"))
        errors.email = "Email inconnu";

    if(err.message.includes("password"))
        errors.password = "Le mot de passe est incorect";

    return errors
};