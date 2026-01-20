const statsDB = {};

function updateStats(userId, game, victoire=false, record=0){
    if(!statsDB[userId]){
        statsDB[userId] = {
            morpion:{victoires:0},
            duel:{victoires:0},
            reaction:{victoires:0, record:0}
        };
    }

    if(victoire) statsDB[userId][game].victoires++;
    if(record>statsDB[userId][game].record) statsDB[userId][game].record = record;
}

async function getStats(userId){
    if(!statsDB[userId]){
        statsDB[userId] = {
            morpion:{victoires:0},
            duel:{victoires:0},
            reaction:{victoires:0, record:0}
        };
    }
    return statsDB[userId];
}

module.exports = { getStats, updateStats };
