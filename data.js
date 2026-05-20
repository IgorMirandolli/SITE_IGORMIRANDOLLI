const portfolioData = {
  pageTitle: "Igor Vinicius Sotili Mirandolli | Portfólio",
  metaDescription: "Portfólio de desenvolvedor Flutter e backend.",
  name: "Igor Vinicius Sotili Mirandolli",
  role: "Desenvolvedor de backend e frontend",
  profileImageUrl: "./imagens/profile.jpg",
  tagline: "Desenvolvo aplicações completas com Flutter e APIs, focado em performance e experiência do usuário.",
  cvUrl: "./imagens/curriculoIgorViniciusSotiliMirandolli.pdf",
  about: `Sou estudante de Sistemas de Informação, atualmente no 5º semestre, com foco em desenvolvimento de software e construção de aplicações completas.

Ao longo da graduação, adquiri conhecimentos em áreas como modelos, métodos e técnicas da engenharia de software, gestão e qualidade de software, sistemas computacionais e segurança, ambientes computacionais e conectividade, usabilidade, desenvolvimento web, mobile e jogos, além de sistemas distribuídos.

Tenho experiência prática com diversas tecnologias, incluindo Node.js, Vue.js, Flutter, Dart, além de ferramentas como Visual Studio Code e GitHub. Também possuo conhecimento em bancos de dados como MySQL, Oracle e ferramentas como DBeaver.

Atualmente, atuo como estagiário de desenvolvimento de software na Secretaria da Agricultura, onde estou finalizando o desenvolvimento de um sistema completo de chamados para a intranet da instituição, envolvendo desde a modelagem até a implementação e testes.

Tenho interesse em evoluir continuamente como desenvolvedor, buscando criar soluções eficientes, bem estruturadas e que gerem valor real.`,
  projects: [
     {
      name: "Burger Factory",
      imageUrl: "./imagens/burgerfactory.png",
      description: "Plataforma full stack para hamburgueria, com cardápio digital, carrinho e checkout para visitantes (sem login obrigatório), além de autenticação para clientes e admins. O sistema inclui painel administrativo para gestão de pedidos e produtos, atualização de status em tempo real e interface responsiva para mobile e desktop.",
      tech: ["Vue.js", "Quasar", "Node.js", "Express", "MySQL", "JWT"],
      github: "https://github.com/IgorMirandolli/FRONTEND_BURGUERFACTORY"
    },
    {
      name: "Patrique Fitness App",
      imageUrl: "./imagens/patriqueapp.png",
      description: "A Patrique Fitness é um ecossistema completo para quem busca saúde e alta performance. Mais do que um simples rastreador de treinos, o app utiliza gamificação e inteligência artificial para manter o usuário motivado e bem orientado.",
      tech: ["Flutter", "Node.js", "MySQL"],
      github: "https://github.com/victorhasse/patrique_app"
    },
    {
      name: "Unisouls",
      mediaText: "Imagem ou vídeo do projeto",
      trailerUrl: "https://www.youtube.com/watch?v=zmuAaCuOgoE",
      description: "É um jogo de Ação e Plataforma 2D no estilo Metroidvania e Soulslike, desenvolvido em Pixel Art com a poderosa Godot Engine. Este projeto foi concebido para um trabalho acadêmico (Universidade do Sul de Santa Catarina - 2º e 4º Semestre de 2025).",
      tech: ["Godot", "Pixel Art"],
      github: "https://github.com/IgorMirandolli/UNISOULS"
    }
  ],
  technologies: [
    { name: "Node.js", level: "Avançado" },
    { name: "dbeaver/oracle", level: "Avançado" },
    { name: "quasar", level: "Avançado" },
    { name: "html/css", level: "Avançado" },
    { name: "Git / GitHub", level: "Avançado" },
    { name: "godot", level: "Avançado" },
    { name: "vue", level: "Intermediário" },
    { name: "Flutter", level: "Intermediário" },
    { name: "Dart", level: "Intermediário" },
    { name: "MySQL", level: "Intermediário" }
  ],
  highlights: [
    "Experiência com sistemas reais na secretaria de agricultura e pecuria de santa catarina, trabalhando com bando de dados, backend e frontend.",
    "Conhecimento em CI/CD",
    "Foco em backend e frontend, com projetos práticos e integração completa."
  ],
  currentFocus: "Desenvolvendo um app de treino completo com backend integrado, e sistema de chamados para a secretaria de agricultura e pecuria de santa catarina.",
  careerGoal: "Buscar oportunidade como dev backend e frontend.",
  contact: {
    email: "igorvsmirandolli@icloud.com",
    linkedin: "https://www.linkedin.com/in/igor-vinicius-sotili-mirandolli-b06392327/",
    github: "https://github.com/IgorMirandolli"
  }
};

module.exports = portfolioData;

