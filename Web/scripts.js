// Aula 9:

/*function enviarForm(event) {
    event.preventDefault();

    const form = event.target;
    const nome = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const cep = form.cep.value.trim();
    const senha = form.senha.value;
    const senhaAlt = form.senhaAlt.value;

    const erroDiv = document.getElementById("mensagemErro");
    const sucessoDiv = document.getElementById("mensagemSucesso");

    let erros = [];

    const regexTelefone = /^\d{2} \d{5}-\d{4}$/;
    const regexCEP = /^\d{5}-\d{3}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    erroDiv.style.display = "none";
    sucessoDiv.style.display = "none";
    erroDiv.innerHTML = "";
    sucessoDiv.innerHTML = "";

    if (nome === "") {
        erros.push("O nome completo é obrigatório.");
    }

    if (!regexTelefone.test(phone)) {
        erros.push('Telefone inválido. Use o formato "00 00000-0000".');
    }

    if (!regexEmail.test(email)) {
        erros.push("Email inválido.");
    }

    if (!regexCEP.test(cep)) {
        erros.push('CEP inválido. Use o formato "00000-000".');
    }

    if (senha.length < 6) {
        erros.push("A senha deve ter pelo menos 6 caracteres.");
    }

    if (senha !== senhaAlt) {
        erros.push("As senhas não são iguais.");
    }

    if (erros.length > 0) {
        erroDiv.innerHTML = erros.join("<br>");
        erroDiv.style.display = "block";
    } else {
        sucessoDiv.innerHTML = `Parabéns, você realizou seu cadastro com o email ${email}. Entraremos em contato através do seu telefone ${phone}. Você ganhou este prêmio ${gift}`;
        sucessoDiv.style.display = "block";
    }
}*/

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxTentativas = 3) {
    let ultimoErro;

    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
        try {
            const resposta = await fetch(url, options);

            let dadosResposta = {};
            try {
                dadosResposta = await resposta.json();
            } catch {
                dadosResposta = {};
            }

            if (!resposta.ok) {
                const erro = new Error(dadosResposta.message || `Erro HTTP: ${resposta.status}`);
                erro.status = resposta.status;

                if (resposta.status >= 400 && resposta.status < 500) {
                    throw erro;
                }

                throw erro;
            }

            return dadosResposta;
        } catch (erro) {
            ultimoErro = erro;
            console.error(`Tentativa ${tentativa} falhou:`, erro);

            if (erro.status >= 400 && erro.status < 500) {
                throw erro;
            }

            if (tentativa < maxTentativas) {
                await esperar(1000);
            } else {
                throw ultimoErro;
            }
        }
    }
}

async function enviarForm(event) {
    event.preventDefault();

    const form = event.target;
    const nome = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const cep = form.cep.value.trim();
    const senha = form.senha.value;
    const senhaAlt = form.senhaAlt.value;

    const erroDiv = document.getElementById("mensagemErro");
    const sucessoDiv = document.getElementById("mensagemSucesso");
    const botao = form.querySelector("button");

    let erros = [];

    const regexTelefone = /^\d{2} \d{5}-\d{4}$/;
    const regexCEP = /^\d{5}-\d{3}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    erroDiv.style.display = "none";
    sucessoDiv.style.display = "none";
    erroDiv.innerHTML = "";
    sucessoDiv.innerHTML = "";

    if (nome === "") {
        erros.push("O nome completo é obrigatório.");
    }

    if (!regexTelefone.test(phone)) {
        erros.push('Telefone inválido. Use o formato "00 00000-0000".');
    }

    if (!regexEmail.test(email)) {
        erros.push("Email inválido.");
    }

    if (!regexCEP.test(cep)) {
        erros.push('CEP inválido. Use o formato "00000-000".');
    }

    if (senha.length < 6) {
        erros.push("A senha deve ter pelo menos 6 caracteres.");
    }

    if (senha !== senhaAlt) {
        erros.push("As senhas não são iguais.");
    }

    if (erros.length > 0) {
        erroDiv.innerHTML = erros.join("<br>");
        erroDiv.style.display = "block";
        return;
    }

    const dados = {
        name: nome,
        phone: phone,
        cep: cep,
        email: email,
        password: senha,
        confirmPassword: senhaAlt
    };

    try {
        botao.disabled = true;
        botao.textContent = "Enviando...";

        const resultado = await fetchWithRetry(
            "https://backend-node-nmze.onrender.com/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            },
            3
        );

        sucessoDiv.innerHTML = `Parabéns ${nome}, você realizou seu cadastro com o email ${email}. Entraremos em contato através do seu telefone ${phone}. Você ganhou este prêmio ${resultado.gift}.`;
        sucessoDiv.style.display = "block";

        form.reset();
    } catch (erro) {
        erroDiv.innerHTML = erro.message || "Não foi possível concluir o cadastro.";
        erroDiv.style.display = "block";
    } finally {
        botao.disabled = false;
        botao.textContent = "Cadastrar";
    }
}
/*
// Aula 8:
let products = [
    { id: "111111", name: "Notebook", price: "3500", brand: "Dell", color: "gray", size: 15.6 },
    { id: "222222", name: "Mouse", price: "150", brand: "Logitech", color: "black", size: null },
    { id: "333333", name: "Teclado", price: "200", brand: "Logitech", color: "black", size: null },
    { id: "444444", name: "Monitor", price: "900", brand: "LG", color: "gray", size: 32 }
];



products.forEach(function (products) {

    console.log("Produto: " + products.name + " | Preço: R$" + products.price);

});



function getFilteredProducts(products) {
    return products.filter(product =>
        Number(product.price) > 500 && product.color === "gray"
    );
}

(async () => {
  try {
    const resp = await fetch("https://fakestoreapi.com/products", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Produto teste",
        price: 1.5,
        description: "Descrição teste",
        category: "Categoria Teste",
        image: "Imagem Teste"
      })
    });

    const data = await resp.json();
    console.log("Resposta:", data);

  } catch (err) {
    console.error("Erro:", err);
  }
})();







// Aula 7:
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
}*/