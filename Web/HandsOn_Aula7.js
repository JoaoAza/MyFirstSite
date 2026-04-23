function nomeCompleto(nome, sobrenome) {
    return nome + " " + sobrenome;
}

function calcularIdade(anoNasc) {
    var anoAtual = new Date().getFullYear();
    return anoAtual - anoNasc;
}

function jaFezAniversario(dia, mes) {
    var hoje = new Date();
    var diaAtual = hoje.getDate();
    var mesAtual = hoje.getMonth() + 1;

    if (mes < mesAtual) {
        return true;
    }

    if (mes == mesAtual && dia <= diaAtual) {
        return true;
    }

    return false;
}

function diasParaAniversario(dia, mes) {
    var hoje = new Date();
    var anoAtual = hoje.getFullYear();
    var aniversario = new Date(anoAtual, mes - 1, dia);

    if (aniversario < hoje) {
        aniversario = new Date(anoAtual + 1, mes - 1, dia);
    }

    var diferenca = aniversario - hoje;
    var dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

    return dias;
}

function mensagem(nome, anoNasc) {
    var idade = calcularIdade(anoNasc);
    return "Olá " + nome + ", você tem " + idade + " anos.";
}

function faltamPara100(nome, anoNasc) {
    var idade = calcularIdade(anoNasc);
    var faltam = 100 - idade;
    return nome + ", faltam " + faltam + " anos para você completar 100 anos.";
}