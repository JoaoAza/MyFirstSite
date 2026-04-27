document.addEventListener("DOMContentLoaded", () => {
  carregarHeader();
});

async function carregarHeader() {
  const container = document.getElementById("header-container");

  if (!container) {
    return;
  }

  try {
    const resposta = await fetch("header.html");

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar o header.");
    }

    container.innerHTML = await resposta.text();
    configurarMenuResponsivo();
    marcarPaginaAtual();
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `
      <header class="site-header">
        <div class="header-container">
          <a class="logo" href="index.html">Meu Primeiro Site</a>
          <nav class="site-nav">
            <ul>
              <li><a href="index.html">Início</a></li>
              <li><a href="sobre.html">Sobre</a></li>
              <li><a href="contato.html">Contato</a></li>
              <li><a href="links.html">Links</a></li>
              <li><a href="cadastro.html">Cadastro</a></li>
              <li><a href="destaque.html">Em destaque</a></li>
            </ul>
          </nav>
        </div>
      </header>
    `;
  }
}

function configurarMenuResponsivo() {
  const botao = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-nav");

  if (!botao || !menu) {
    return;
  }

  botao.addEventListener("click", () => {
    const menuAberto = menu.classList.toggle("open");
    botao.setAttribute("aria-expanded", menuAberto ? "true" : "false");
  });
}

function marcarPaginaAtual() {
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".site-nav a");

  links.forEach(link => {
    const paginaLink = link.getAttribute("href");

    if (paginaLink === paginaAtual) {
      link.classList.add("active");
    }
  });
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function obterContainerNotificacoes() {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-label", "Notificações do sistema");
    document.body.appendChild(container);
  }

  return container;
}

function mostrarNotificacao(mensagem, tipo = "erro", tempo = 6000) {
  const container = obterContainerNotificacoes();
  const notificacao = document.createElement("div");

  notificacao.className = "toast toast-" + tipo;
  notificacao.innerHTML = 
    "<strong>" + (tipo === "erro" ? "Erro" : "Aviso") + "</strong>" +
    "<span>" + mensagem + "</span>";

  container.appendChild(notificacao);

  setTimeout(() => {
    notificacao.classList.add("toast-saindo");

    setTimeout(() => {
      notificacao.remove();
    }, 350);
  }, tempo);
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

const FEATURED_API_URL = "https://backend-node-nmze.onrender.com/featured";
const FEATURED_CACHE_KEY = "featuredProductsCache";
const FEATURED_CACHE_TIME = 2 * 60 * 1000;
const FEATURED_MAX_TENTATIVAS = 5;
const FEATURED_INTERVALO_TENTATIVA = 3000;

document.addEventListener("DOMContentLoaded", () => {
  iniciarPaginaDestaques();
});

function iniciarPaginaDestaques() {
  const container = document.getElementById("featuredProducts");

  if (!container) {
    return;
  }

  carregarProdutosEmDestaque();
}

function mostrarElemento(elemento, deveMostrar) {
  if (!elemento) {
    return;
  }

  elemento.style.display = deveMostrar ? "block" : "none";
}

function limparTelaDestaques() {
  const erro = document.getElementById("featuredError");
  const vazio = document.getElementById("featuredEmpty");
  const container = document.getElementById("featuredProducts");

  mostrarElemento(erro, false);
  mostrarElemento(vazio, false);
  erro.innerHTML = "";
  container.innerHTML = "";
}

function setLoadingDestaques(carregando) {
  const loading = document.getElementById("featuredLoading");
  mostrarElemento(loading, carregando);
}

function mostrarErroDestaques(mensagem) {
  const erro = document.getElementById("featuredError");
  erro.innerHTML = mensagem;
  mostrarElemento(erro, true);
}

function obterCacheDestaques() {
  const cacheTexto = localStorage.getItem(FEATURED_CACHE_KEY);

  if (!cacheTexto) {
    return null;
  }

  try {
    const cache = JSON.parse(cacheTexto);
    const cacheValido = Date.now() - cache.criadoEm < FEATURED_CACHE_TIME;

    if (!cacheValido) {
      localStorage.removeItem(FEATURED_CACHE_KEY);
      return null;
    }

    return cache.produtos;
  } catch {
    localStorage.removeItem(FEATURED_CACHE_KEY);
    return null;
  }
}

function salvarCacheDestaques(produtos) {
  const cache = {
    criadoEm: Date.now(),
    produtos: produtos
  };

  localStorage.setItem(FEATURED_CACHE_KEY, JSON.stringify(cache));
}

async function buscarProdutosComRetry() {
  let ultimoErro;

  for (let tentativa = 1; tentativa <= FEATURED_MAX_TENTATIVAS; tentativa++) {
    try {
      const resposta = await fetch(FEATURED_API_URL);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const dados = await resposta.json();
      const produtosPreparados = prepareProducts(dados);

      if (produtosPreparados.length === 0) {
        throw new Error("A API retornou uma lista vazia ou sem produtos válidos em destaque.");
      }

      return produtosPreparados;
    } catch (erro) {
      ultimoErro = erro;
      console.error(`Tentativa ${tentativa} de carregar produtos falhou:`, erro);


      mostrarNotificacao(
        `Tentativa ${tentativa} de ${FEATURED_MAX_TENTATIVAS} falhou: ${erro.message}`,
        "erro"
      );
      if (tentativa < FEATURED_MAX_TENTATIVAS) {
        await esperar(FEATURED_INTERVALO_TENTATIVA);
      }
    }
  }

  throw ultimoErro;
}

function extrairListaDeProdutos(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: String(product.title || product.name || "").trim(),
    price: Number(product.price),
    highlight: product.highlight === true || product.highlight === "true"
  };
}

function nomeProdutoValido(title) {
  const nomeNormalizado = String(title)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return nomeNormalizado !== "" && nomeNormalizado !== "sem nome";
}

function validateProduct(product) {
  return Boolean(
    product &&
    nomeProdutoValido(product.title) &&
    Number(product.price) > 0 &&
    product.highlight === true
  );
}

function prepareProducts(data) {
  const listaProdutos = extrairListaDeProdutos(data);

  return listaProdutos
    .map(normalizeProduct)
    .filter(validateProduct);
}

function renderProducts(products) {
  const container = document.getElementById("featuredProducts");
  const vazio = document.getElementById("featuredEmpty");

  if (products.length === 0) {
    mostrarElemento(vazio, true);
    container.innerHTML = "";
    return;
  }

  let html = "";

  products.forEach(product => {
    html += `
      <article class="product-card">
        <div class="product-badge">Destaque</div>
        <h2>${product.title}</h2>
        <p class="product-price">R$ ${product.price.toFixed(2)}</p>
        <p class="product-description">Melhorzinho da categoria.</p>
      </article>
    `;
  });

  container.innerHTML = html;
}

async function carregarProdutosEmDestaque() {
  limparTelaDestaques();

  const produtosEmCache = obterCacheDestaques();

  if (produtosEmCache) {
    renderProducts(produtosEmCache);
    return;
  }

  try {
    setLoadingDestaques(true);
    const produtosPreparados = await buscarProdutosComRetry();

    salvarCacheDestaques(produtosPreparados);
    renderProducts(produtosPreparados);
  } catch {
    renderProducts([]);
    mostrarErroDestaques("Erro ao carregar produtos. Tente novamente mais tarde.");
  } finally {
    setLoadingDestaques(false);
  }
}
