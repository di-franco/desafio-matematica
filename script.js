// Elementos do HTML
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game-button');
const welcomeArea = document.getElementById('welcome-area');

const gameArea = document.getElementById('game-area');
const timerDisplay = document.getElementById('timer-display');
const countdownEl = document.getElementById('countdown');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-button');

const feedbackOverlay = document.getElementById('feedback-overlay');
const overlayMessage = document.getElementById('overlay-message');
const overlayDetails = document.getElementById('overlay-details');
const nextPlayerButton = document.getElementById('next-player-button');

const physicalChallengeArea = document.getElementById('physical-challenge');
const challengeTextEl = document.getElementById('challenge-text');
const challengeDoneButton = document.getElementById('challenge-done-button');

// Elementos das seleções
const team1PlayersUl = document.getElementById('team1-players');
const team2PlayersUl = document.getElementById('team2-players');
const teamScaledMessage = document.getElementById('team-scaled-message');

// Referência ao container principal (para escondê-lo quando o overlay aparecer)
const mainContainer = document.querySelector('.container');

// Referência à div do placar "Jogadores no Time"
const scoresDisplay = document.querySelector('.scores');


// Variáveis do Jogo
let currentPlayerName = '';
let currentQuestion = {};
let gameActive = false;
let timer;
const timeLimit = 30; // 30 segundos
let timeLeft = timeLimit;

let currentTeamToAdd = 1; // 1 para Seleção 1, 2 para Seleção 2
const maxPlayersPerTeam = 5; // Limite de jogadores por seleção

// --- Funções do Jogo ---

/**
 * Inicia o estado inicial do jogo ao carregar a página.
 * Mostra apenas a welcomeArea e esconde todo o resto.
 */
function initializeGame() {
    // Garante que o container principal e a welcomeArea são os únicos visíveis no início
    mainContainer.classList.remove('hidden'); 
    welcomeArea.classList.remove('hidden');   
    
    // Esconde todas as outras áreas que NÃO devem aparecer na tela inicial
    gameArea.classList.add('hidden'); 
    feedbackOverlay.classList.add('hidden'); 
    physicalChallengeArea.classList.add('hidden'); 
    teamScaledMessage.classList.add('hidden'); 
    scoresDisplay.classList.add('hidden');     
    
    document.body.className = ''; // Remove qualquer classe de cor do body

    // Zera os contadores e limpa as listas
    team1PlayersUl.innerHTML = '';
    team2PlayersUl.innerHTML = '';
    currentTeamToAdd = 1; // Começa sempre pela Seleção 1
    
    playerNameInput.value = ''; // Limpa o campo de nome
    playerNameInput.focus(); // Coloca o foco no campo de nome
    startGameButton.disabled = false; // Garante que o botão "Escalar" esteja habilitado ao iniciar
}

/**
 * Gera uma pergunta de multiplicação aleatória.
 */
function generateMultiplicationQuestion() {
    const num1 = Math.floor(Math.random() * 9) + 2; // Números de 2 a 10
    const num2 = Math.floor(Math.random() * 9) + 2;
    const question = `${num1} x ${num2}?`;
    const correctAnswer = num1 * num2;
    return { question, correctAnswer };
}

/**
 * Gera uma pergunta de divisão aleatória, garantindo resposta inteira.
 */
function generateDivisionQuestion() {
    let num2 = Math.floor(Math.random() * 9) + 2; // Divisor de 2 a 10
    let correctAnswer = Math.floor(Math.random() * 9) + 2; // Quociente de 2 a 10
    let num1 = num2 * correctAnswer; // Dividendo
    const question = `${num1} / ${num2}?`;
    return { question, correctAnswer };
}

/**
 * Inicia o cronômetro para a pergunta atual.
 */
function startTimer() {
    clearInterval(timer); // Garante que qualquer timer anterior seja limpo
    timeLeft = timeLimit;
    countdownEl.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeUp();
        }
    }, 1000);
}

/**
 * Lida quando o tempo do cronômetro acaba.
 */
function handleTimeUp() {
    if (!gameActive) return;
    gameActive = false;
    showFeedback(false, "Que pena, seu tempo acabou!", `A resposta correta era ${currentQuestion.correctAnswer}.`, 'time-up');
}

/**
 * Inicia um novo desafio de matemática para o jogador atual.
 * Esconde a welcomeArea e mostra a gameArea.
 */
function startNewMathChallenge() {
    // Verifica se os times já estão escalados antes de iniciar um novo desafio
    if (team1PlayersUl.children.length >= maxPlayersPerTeam && team2PlayersUl.children.length >= maxPlayersPerTeam) {
        // Se os times estiverem completos, não inicia um novo desafio, apenas mostra a mensagem final
        teamScaledMessage.classList.remove('hidden'); 
        document.body.classList.add('team-scaled'); 
        launchConfetti(); 
        startGameButton.disabled = true; 
        
        // Garante que a welcomeArea esteja visível para mostrar as seleções e a mensagem
        welcomeArea.classList.remove('hidden');
        gameArea.classList.add('hidden'); 
        mainContainer.classList.remove('hidden'); 
        return; 
    }

    // Lógica para transição de tela:
    welcomeArea.classList.add('hidden'); 
    gameArea.classList.remove('hidden'); 

    document.body.className = ''; // Limpa as classes de cor do body
    
    gameActive = true;
    
    generateAndDisplayQuestion();
    startTimer();
}

/**
 * Gera e exibe uma nova pergunta.
 */
function generateAndDisplayQuestion() {
    const questionType = Math.random() < 0.5 ? 'multiplication' : 'division';

    if (questionType === 'multiplication') {
        currentQuestion = generateMultiplicationQuestion();
    } else {
        currentQuestion = generateDivisionQuestion();
    }

    questionEl.textContent = `Olá ${currentPlayerName}! Quanto é ${currentQuestion.question}`;
    answerInput.value = '';
    answerInput.focus();
}

/**
 * Lida com a submissão da resposta do aluno.
 */
function handleSubmitAnswer() {
    if (!gameActive) return;

    clearInterval(timer); // Para o cronômetro

    const userAnswer = parseInt(answerInput.value);

    if (isNaN(userAnswer)) {
        questionEl.textContent = `Olá ${currentPlayerName}! Por favor, digite um número!`;
        answerInput.value = '';
        answerInput.focus();
        startTimer(); // Reinicia o timer para o jogador tentar novamente
        return;
    }

    gameActive = false;

    if (userAnswer === currentQuestion.correctAnswer) { 
        addPlayerToTeam(currentPlayerName); // Adiciona o jogador à seleção
        // Se a resposta estiver correta, mostra feedback de sucesso
        showFeedback(true, "Parabéns, você está no time!", `A resposta correta era ${currentQuestion.correctAnswer}.`, 'correct-answer');
    } else {
        // Se a resposta estiver incorreta, mostra feedback de falha
        showFeedback(false, "Que pena, ainda não é sua hora de jogar.", `A resposta correta era ${currentQuestion.correctAnswer}.`, 'wrong-answer');
    }
}

/**
 * Adiciona o nome do jogador à lista da seleção correspondente.
 * Alterna entre Seleção 1 e Seleção 2.
 * @param {string} playerName - O nome do jogador a ser adicionado.
 */
function addPlayerToTeam(playerName) {
    if (team1PlayersUl.children.length < maxPlayersPerTeam && currentTeamToAdd === 1) {
        const listItem = document.createElement('li');
        listItem.textContent = playerName;
        team1PlayersUl.appendChild(listItem);
        currentTeamToAdd = 2; // Próximo jogador vai para a Seleção 2
    } else if (team2PlayersUl.children.length < maxPlayersPerTeam && currentTeamToAdd === 2) {
        const listItem = document.createElement('li');
        listItem.textContent = playerName;
        team2PlayersUl.appendChild(listItem);
        currentTeamToAdd = 1; // Próximo jogador vai para a Seleção 1
    } else if (team1PlayersUl.children.length < maxPlayersPerTeam) { // Se a Seleção 2 estiver cheia, mas a 1 não
        const listItem = document.createElement('li');
        listItem.textContent = playerName;
        team1PlayersUl.appendChild(listItem);
        currentTeamToAdd = 2;
    } else if (team2PlayersUl.children.length < maxPlayersPerTeam) { // Se a Seleção 1 estiver cheia, mas a 2 não
        const listItem = document.createElement('li');
        listItem.textContent = playerName;
        team2PlayersUl.appendChild(listItem);
        currentTeamToAdd = 1;
    } else {
        // Ambos os times estão cheios, não adiciona mais jogadores.
        return; 
    }

    // Verifica se ambos os times estão cheios
    if (team1PlayersUl.children.length >= maxPlayersPerTeam && team2PlayersUl.children.length >= maxPlayersPerTeam) {
        teamScaledMessage.classList.remove('hidden'); // Mostra a mensagem
        document.body.classList.add('team-scaled'); // Muda a cor de fundo do body
        launchConfetti(); // Lança os confetes
        startGameButton.disabled = true; // Desabilita o botão "Escalar"
    }
}

/**
 * Lança o efeito de confete.
 */
function launchConfetti() {
    // Verifica se a função 'confetti' está disponível globalmente antes de usar
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 180,
            origin: { y: 0.6 }
        });
    } else {
        console.warn("Confetti.js não está carregado. A animação de confete não funcionará.");
    }
}


/**
 * Exibe o overlay de feedback com a mensagem e cor apropriadas.
 * Esconde o container principal e mostra o overlay.
 */
function showFeedback(isCorrect, message, details, bodyClass) {
    mainContainer.classList.add('hidden'); // Esconde o container principal
    gameArea.classList.add('hidden'); // Garante que a área do jogo esteja escondida
    physicalChallengeArea.classList.add('hidden'); // Garante que desafios físicos também estejam escondidos
    welcomeArea.classList.add('hidden'); // Garante que a welcomeArea também esteja escondida

    feedbackOverlay.classList.remove('hidden'); // Mostra o overlay de feedback

    overlayMessage.textContent = message;
    overlayDetails.textContent = details;

    document.body.className = bodyClass;
}

/**
 * Lida com o clique no botão "Próximo Desafiante" após o feedback.
 * Esconde o overlay e volta para a tela inicial (welcomeArea).
 */
function handleNextPlayer() {
    feedbackOverlay.classList.add('hidden'); // Esconde o overlay de feedback
    
    // Se os times estiverem completos, a página permanece no estado final sem iniciar novo jogo
    if (team1PlayersUl.children.length >= maxPlayersPerTeam && team2PlayersUl.children.length >= maxPlayersPerTeam) {
        mainContainer.classList.remove('hidden'); // Mostra o container principal para exibir as seleções
        welcomeArea.classList.remove('hidden'); // Mostra a welcomeArea para exibir as seleções e a mensagem final
        teamScaledMessage.classList.remove('hidden'); // Garante que a mensagem final continue visível
        document.body.classList.add('team-scaled'); // Garante a cor de fundo final
        startGameButton.disabled = true; // Mantém o botão "Escalar" desabilitado
    } else {
        // Se os times NÃO estiverem completos, retorna para a tela inicial de jogo
        mainContainer.classList.remove('hidden'); // Mostra o container principal
        welcomeArea.classList.remove('hidden'); // Mostra a tela de boas-vindas
        playerNameInput.value = ''; // Limpa o campo de nome
        playerNameInput.focus(); // Coloca o foco no campo de nome
        startGameButton.disabled = false; // Reabilita o botão "Escalar" para o próximo jogador
        document.body.className = ''; // Remove as classes de cor do body
        teamScaledMessage.classList.add('hidden'); // Esconde a mensagem de time escalado se não estiver completo
    }
}

/**
 * Função para mostrar o desafio físico (se for ativada manualmente)
 * Esconde o container principal e o feedback overlay, e mostra o desafio físico.
 */
function showPhysicalChallenge() {
    mainContainer.classList.add('hidden'); // Esconde o container principal
    feedbackOverlay.classList.add('hidden'); // Esconde o overlay de feedback
    gameArea.classList.add('hidden'); // Esconde a área do jogo
    welcomeArea.classList.add('hidden'); // Garante que a welcomeArea também esteja escondida
    
    physicalChallengeArea.classList.remove('hidden'); // Mostra a área de desafio físico
    document.body.className = ''; // Remove as classes de cor do body
    
    const physicalChallenges = [
        "Todos: Realizem 10 polichinelos!",
        "Todos: Façam 5 agachamentos e 5 flexões!",
        "Todos: Fiquem na posição de prancha por 20 segundos!",
        "Todos: Corram até a parede e voltem 3 vezes!",
        "Todos: Saltem 10 vezes com os dois pés juntos!",
        "Todos: Deem 5 passos de 'caranguejo' para frente e para trás!",
    ];
    const randomChallenge = physicalChallenges[Math.floor(Math.random() * physicalChallenges.length)];
    challengeTextEl.textContent = randomChallenge;
}

/**
 * Botão "Desafio Concluído" (do desafio físico)
 * Esconde o desafio físico e volta para a tela inicial (welcomeArea).
 */
challengeDoneButton.addEventListener('click', () => {
    physicalChallengeArea.classList.add('hidden'); // Esconde o desafio físico
    // Lógica para retornar à tela inicial, considerando se os times já estão escalados
    if (team1PlayersUl.children.length >= maxPlayersPerTeam && team2PlayersUl.children.length >= maxPlayersPerTeam) {
        mainContainer.classList.remove('hidden');
        welcomeArea.classList.remove('hidden');
        teamScaledMessage.classList.remove('hidden');
        document.body.classList.add('team-scaled');
        startGameButton.disabled = true;
    } else {
        mainContainer.classList.remove('hidden');
        welcomeArea.classList.remove('hidden');
        playerNameInput.value = '';
        playerNameInput.focus();
        document.body.className = '';
        startGameButton.disabled = false;
    }
});


// --- Event Listeners ---
startGameButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name === '') {
        alert("Por favor, digite seu nome para jogar!");
        playerNameInput.focus();
        return; 
    }
    currentPlayerName = name;
    startNewMathChallenge(); // Esta é a função que deve fazer a transição
});

submitButton.addEventListener('click', handleSubmitAnswer);

answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSubmitAnswer();
    }
});

nextPlayerButton.addEventListener('click', handleNextPlayer);

// Inicializa o estado do jogo quando a página carrega
document.addEventListener('DOMContentLoaded', initializeGame);