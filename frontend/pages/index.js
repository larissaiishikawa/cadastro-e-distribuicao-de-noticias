import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { X } from "lucide-react";
import dotenv from "dotenv";

dotenv.config();

export default function PortalNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [noticiasPorPagina] = useState(9);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    senha: "",
  });

  const [registerForm, setRegisterForm] = useState({
    nome: "",
    email: "",
    senha: "",
    repetirSenha: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuario({
          nome: decoded.username || decoded.email,
          ...decoded,
        });
      } catch {
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setCarregando(true);
        setErro(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news`);

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Notícias da API:", data);

        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          setNoticias(data.news);
        } else {
          console.warn("API retornou dados vazios, usando fallback");
        }
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchNoticias();
  }, []);

  const indexUltimaNoticia = paginaAtual * noticiasPorPagina;
  const indexPrimeiraNoticia = indexUltimaNoticia - noticiasPorPagina;
  const noticiasAtuais = noticias.slice(
    indexPrimeiraNoticia,
    indexUltimaNoticia
  );

  const totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const irParaPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
  };

  const formatarData = (data) => {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString("pt-BR");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!loginForm.email) errors.email = "Email é obrigatório";
    if (!loginForm.senha) errors.senha = "Senha é obrigatória";
    if (Object.keys(errors).length === 0) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginForm.email,
            password: loginForm.senha,
          }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          try {
            const decoded = jwtDecode(data.token);
            setUsuario({ nome: decoded.username, ...decoded });
          } catch {
            setUsuario(null);
          }
          alert("Login realizado com sucesso!");
          setShowLoginModal(false);
          setLoginForm({ email: "", senha: "" });
        } else {
          setFormErrors({ geral: data.message || "Erro ao fazer login." });
        }
      } catch (err) {
        setFormErrors({ geral: "Erro de conexão com o servidor." });
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!registerForm.nome) errors.nome = "Nome é obrigatório";
    if (!registerForm.email) errors.email = "Email é obrigatório";
    if (!registerForm.senha) errors.senha = "Senha é obrigatória";
    if (!registerForm.repetirSenha) errors.repetirSenha = "Confirme a senha";
    if (registerForm.senha !== registerForm.repetirSenha) {
      errors.repetirSenha = "As senhas não coincidem";
    }
    if (Object.keys(errors).length === 0) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: registerForm.nome,
            email: registerForm.email,
            password: registerForm.senha,
            isAdmin: false,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          alert("Registro realizado com sucesso! Faça login para continuar.");
          setShowRegisterModal(false);
          setRegisterForm({ nome: "", email: "", senha: "", repetirSenha: "" });
        } else {
          setFormErrors({ geral: data.message || "Erro ao registrar." });
        }
      } catch (err) {
        setFormErrors({ geral: "Erro de conexão com o servidor." });
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleInputChange = (formType, field, value) => {
    if (formType === "login") {
      setLoginForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setRegisterForm((prev) => ({ ...prev, [field]: value }));
    }

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const closeModal = (modalType) => {
    if (modalType === "login") {
      setShowLoginModal(false);
      setLoginForm({ email: "", senha: "" });
    } else {
      setShowRegisterModal(false);
      setRegisterForm({ nome: "", email: "", senha: "", repetirSenha: "" });
    }
    setFormErrors({});
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Portal de Notícias</title>
        <meta name="description" content="Suas notícias em primeira mão" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-yellow-400 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="relative w-full mb-4">
              <div className="flex justify-center items-center">
                <h1 className="text-4xl font-bold text-gray-800 text-center">
                  Portal de Notícias
                </h1>
              </div>

              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 flex items-center gap-2">
                {usuario && (usuario.nome || usuario.email) && (
                  <>
                    <span className="mr-2 text-gray-800 font-medium">
                      Bem-vindo, {usuario.nome || usuario.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-md text-sm transition-colors"
                    >
                      Sair
                    </button>
                  </>
                )}
                {!usuario && (
                  <>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Iniciar Sessão
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Registrar
                    </button>
                  </>
                )}
                {usuario && usuario.isAdmin && (
                  <Link href="/criar-noticia">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg text-sm">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Nova Notícia
                    </button>
                  </Link>
                )}
              </div>
            </div>

            <p className="text-center text-gray-700">
              Suas notícias em primeira mão
            </p>

            {erro && (
              <div className="mt-2 text-center">
                <span className="text-red-600 text-sm bg-red-100 px-3 py-1 rounded">
                  Aviso: Usando dados de exemplo (Erro na API: {erro})
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {noticias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Nenhuma notícia encontrada no momento.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {noticiasAtuais.map((noticia) => (
                  <article
                    key={noticia._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link href={`/noticia/${noticia._id}`}>
                      <div className="h-48 overflow-hidden cursor-pointer">
                        <img
                          src={
                            noticia.imagem ||
                            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop"
                          }
                          alt={noticia.titulo}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop";
                          }}
                        />
                      </div>
                    </Link>

                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {noticia.categoria || "Geral"}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatarData(noticia.dataPublicacao || new Date())}
                        </span>
                      </div>

                      <Link href={`/noticia/${noticia._id}`}>
                        <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-yellow-600 transition-colors cursor-pointer">
                          {noticia.titulo}
                        </h2>
                      </Link>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {noticia.subtitulo ||
                          noticia.descricao?.substring(0, 150) + "..."}
                      </p>

                      <div className="mt-4">
                        <Link href={`/noticia/${noticia._id}`}>
                          <span className="text-yellow-600 hover:text-yellow-800 font-medium text-sm cursor-pointer">
                            Leia mais →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {totalPaginas > 1 && (
                <>
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={paginaAnterior}
                      disabled={paginaAtual === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        paginaAtual === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      ← Anterior
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPaginas }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => irParaPagina(index + 1)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            paginaAtual === index + 1
                              ? "bg-yellow-400 text-gray-800"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={proximaPagina}
                      disabled={paginaAtual === totalPaginas}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        paginaAtual === totalPaginas
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      Próximo →
                    </button>
                  </div>

                  <div className="text-center mt-4 text-gray-600">
                    Mostrando {indexPrimeiraNoticia + 1} a{" "}
                    {Math.min(indexUltimaNoticia, noticias.length)} de{" "}
                    {noticias.length} notícias
                  </div>
                </>
              )}
            </>
          )}
        </main>

        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Portal de Notícias</h3>
              <p className="text-gray-300 mb-4">
                Mantendo você informado sobre os principais acontecimentos
              </p>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-sm">
                  © 2025 Portal de Notícias. Todos os direitos reservados.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Desenvolvido pelo Grupo 4 - Certificadora de Competência
                  Identitária
                </p>
              </div>
            </div>
          </div>
        </footer>

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Iniciar Sessão
                </h2>
                <button
                  onClick={() => closeModal("login")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {formErrors.geral && (
                  <p className="text-red-500 text-sm mb-2">
                    {formErrors.geral}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    value={loginForm.email}
                    onChange={(e) =>
                      handleInputChange("login", "email", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Seu email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="login-senha"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    id="login-senha"
                    value={loginForm.senha}
                    onChange={(e) =>
                      handleInputChange("login", "senha", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.senha ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Sua senha"
                  />
                  {formErrors.senha && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.senha}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Entrar
                </button>
              </form>
            </div>
          </div>
        )}

        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Criar Conta
                </h2>
                <button
                  onClick={() => closeModal("register")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {formErrors.geral && (
                  <p className="text-red-500 text-sm mb-2">
                    {formErrors.geral}
                  </p>
                )}
                <div>
                  <label
                    htmlFor="register-nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="register-nome"
                    value={registerForm.nome}
                    onChange={(e) =>
                      handleInputChange("register", "nome", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.nome ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Seu nome completo"
                  />
                  {formErrors.nome && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    value={registerForm.email}
                    onChange={(e) =>
                      handleInputChange("register", "email", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Seu email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-senha"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    id="register-senha"
                    value={registerForm.senha}
                    onChange={(e) =>
                      handleInputChange("register", "senha", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.senha ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Sua senha"
                  />
                  {formErrors.senha && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.senha}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-repetir-senha"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="register-repetir-senha"
                    value={registerForm.repetirSenha}
                    onChange={(e) =>
                      handleInputChange(
                        "register",
                        "repetirSenha",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      formErrors.repetirSenha
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirme sua senha"
                  />
                  {formErrors.repetirSenha && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.repetirSenha}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Criar Conta
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
