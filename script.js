// Simulación de Baccarat
const deck = [];
const suits = ['♠', '♥', '♦', '♣'];
const values = [1,2,3,4,5,6,7,8,9,10,11,12,13]; // 1=As, 11=J, 12=Q, 13=K

// Contadores de victorias (persisten en localStorage)
let counts = { player: 0, banker: 0, ties: 0 };

function loadCounts() {
    try {
        const raw = localStorage.getItem('baccarat_counts');
        if (raw) counts = JSON.parse(raw);
    } catch (e) {
        // si falla, dejamos los valores por defecto
    }
}

function saveCounts() {
    try {
        localStorage.setItem('baccarat_counts', JSON.stringify(counts));
    } catch (e) {
        // ignore
    }
}

function updateCountersUI() {
    const counters = document.getElementById('counters');
    if (!counters) return;
    // mostrar el contenedor si está oculto
    counters.classList.remove('hidden');
    document.getElementById('player-wins').textContent = counts.player;
    document.getElementById('banker-wins').textContent = counts.banker;
    document.getElementById('ties').textContent = counts.ties;
}

function getCardValue(val) {

    if (val === 1) {
        return 1; // As
    }

    if (val >= 10) {
        return 0; // 10, J, Q, K
    }

    return val;
}

function getCardLabel(val) {

    if (val === 1)  {
        return 'A';
    }

    if (val === 11) {
        return 'J';
    }

    if (val === 12) {
        return 'Q';
    }

    if (val === 13) {
        return 'K';
    }

    return val;
}

function buildDeck() {

    let d = [];

    for (let s of suits) {
        
        for (let v of values) {
            d.push({suit: s, value: v});
        }

    }

    return d;
}

function shuffle(array) {
    
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

}

function drawCard(deck) {
    return deck.pop();
}

function handValue(hand) {
    let sum = hand.reduce((acc, c) => acc + getCardValue(c.value), 0);
    return sum % 10;
}

function renderCards(container, hand) {
    container.innerHTML = '';

    hand.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = getCardLabel(card.value) + card.suit;
        container.appendChild(div);
    });

}

function renderScore(container, score) {
    container.textContent = 'Puntos: ' + score;
}

function resetGame() {
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('banker-cards').innerHTML = '';
    document.getElementById('player-score').textContent = '';
    document.getElementById('banker-score').textContent = '';
    document.getElementById('result').textContent = '';

    // Reiniciar contadores también
    counts.player = 0;
    counts.banker = 0;
    counts.ties = 0;
    saveCounts();
    updateCountersUI();
}

function playBaccarat() {
    let deck = buildDeck();
    shuffle(deck);
    
    let player = [drawCard(deck), drawCard(deck)];
    let banker = [drawCard(deck), drawCard(deck)];
    
    let playerScore = handValue(player);
    let bankerScore = handValue(banker);

    renderCards(document.getElementById('player-cards'), player);
    renderCards(document.getElementById('banker-cards'), banker);
    renderScore(document.getElementById('player-score'), playerScore);
    renderScore(document.getElementById('banker-score'), bankerScore);
    
    let natural = (playerScore === 8 || playerScore === 9 || bankerScore === 8 || bankerScore === 9);
    
    // Reglas de tercera carta para el jugador
    let playerThird = null;

    if (!natural) {

        if (playerScore <= 5) {
            playerThird = drawCard(deck);
            player.push(playerThird);
            playerScore = handValue(player);
            renderCards(document.getElementById('player-cards'), player);
            renderScore(document.getElementById('player-score'), playerScore);
        }

    }
    // Reglas de tercera carta para la banca
    let bankerThird = null;
    
    if (!natural) {

        if (playerThird === null) {
            
            // Si el jugador no tomó tercera carta
            if (bankerScore <= 5) {
                bankerThird = drawCard(deck);
                banker.push(bankerThird);
                bankerScore = handValue(banker);
                renderCards(document.getElementById('banker-cards'), banker);
                renderScore(document.getElementById('banker-score'), bankerScore);
            }

        } 
        else {
            
            // Si el jugador tomó tercera carta, reglas específicas
            let ptv = getCardValue(playerThird.value);
            
            if (bankerScore <= 2) {
                bankerThird = drawCard(deck);
                banker.push(bankerThird);
            }

            else if (bankerScore === 3 && ptv !== 8) {
                bankerThird = drawCard(deck);
                banker.push(bankerThird);
            }

            else if (bankerScore === 4 && (ptv >= 2 && ptv <= 7)) {
                bankerThird = drawCard(deck);
                banker.push(bankerThird);
            } 
            
            else if (bankerScore === 5 && (ptv >= 4 && ptv <= 7)) {
                bankerThird = drawCard(deck);
                banker.push(bankerThird);
            } 
            
            else if (bankerScore === 6 && (ptv === 6 || ptv === 7)) {
                bankerThird = drawCard(deck);
                banker.push(bankerThird);
            }

            if (bankerThird) {
                bankerScore = handValue(banker);
                renderCards(document.getElementById('banker-cards'), banker);
                renderScore(document.getElementById('banker-score'), bankerScore);
            }
        }
    }
    // Determinar ganador
    let result = '';

    if (playerScore > bankerScore) {
        result = '¡Gana el Jugador!';
    } 
    
    else if (bankerScore > playerScore) {
        result = '¡Gana la Banca!';
    } 
    
    else {
        result = 'Empate.';
    }
    document.getElementById('result').textContent = result;

    // Actualizar contadores según resultado
    if (result.includes('Jugador')) {
        counts.player += 1;
    } else if (result.includes('Banca')) {
        counts.banker += 1;
    } else {
        counts.ties += 1;
    }
    saveCounts();
    updateCountersUI();
}

document.getElementById('deal-btn').addEventListener('click', playBaccarat);
document.getElementById('reset-btn').addEventListener('click', resetGame);

// Inicializar contadores al cargar el script
loadCounts();
// Si ya hay conteos previos, mostrar inmediatamente (opcional)
if (counts.player || counts.banker || counts.ties) updateCountersUI();