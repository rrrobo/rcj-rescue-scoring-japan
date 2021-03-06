function line_calc_score(run) {
    try {
        //console.log(run);
        let score = 0;
        let final_score;
        let multiplier = 1.0;

        let lastDropTile = 0;
        let dropTileCount = 0;

        let total_lops = 0;
        for(let i=0;i<run.LoPs.length;i++){
            total_lops += run.LoPs[i];
        }

        for (let i = 0; i < run.tiles.length; i++) {
            let tile = run.tiles[i];

            for (let j=0; j<tile.scoredItems.length;j++){
                switch (tile.scoredItems[j].item){
                    case "checkpoint":
                        let tileCount = i - lastDropTile;
                        if(typeof run.LoPs[dropTileCount] === "undefined")run.LoPs.push(0);
                        score += Math.max(tileCount * (5 - 2 * run.LoPs[dropTileCount]), 0) * tile.scoredItems[j].scored;
                        break;
                    case "gap":
                        score += 10 * tile.scoredItems[j].scored;
                        break;
                    case "intersection":
                        score += 10 * tile.scoredItems[j].scored * tile.scoredItems[j].count;
                        break;
                    case "obstacle":
                        score += 15 * tile.scoredItems[j].scored;
                        break;
                    case "speedbump":
                        score += 5 * tile.scoredItems[j].scored;
                        break;
                    case "ramp":
                        score += 10 * tile.scoredItems[j].scored;
                        break;
                    case "seesaw":
                        score += 15 * tile.scoredItems[j].scored;
                        break;
                }

            }

            if (tile.isDropTile) {
                lastDropTile = i
                dropTileCount++
            }
        }

        let error = 1;
        if (run.rescueOrder) {
            if(typeof run.LoPs[dropTileCount] === "undefined")run.LoPs.push(0);
            if (run.evacuationLevel == 1) {
                for (let victim of run.rescueOrder) {
                    if(victim.type == "K"){
                        if(run.kitLevel == 1) multiplier *= Math.max(1100-(25*run.LoPs[run.EvacuationAreaLoPIndex]),1000);
                        else multiplier *= Math.max(1300-(25*run.LoPs[run.EvacuationAreaLoPIndex]),1000);
                        error *= 1000;
                    } else if (victim.effective){
                        multiplier *= Math.max(1200-(25*run.LoPs[run.EvacuationAreaLoPIndex]),1000);
                        error *= 1000;
                    }
                }
            } else if (run.evacuationLevel == 2) {
                for (let victim of run.rescueOrder) {
                    if(victim.type == "K"){
                        if(run.kitLevel == 1) multiplier *= Math.max(1200-(50*run.LoPs[run.EvacuationAreaLoPIndex]),1000);
                        else multiplier *= Math.max(1600-(50*run.LoPs[run.EvacuationAreaLoPIndex]),1000);
                        error *= 1000;
                    } else if (victim.effective){
                        multiplier *= Math.max(1400-(50*run.LoPs[run.EvacuationAreaLoPIndex]),1000);
                        error *= 1000;
                    }
                }
            }
            multiplier /= error;
        }


        if (run.exitBonus) {
            score += Math.max(60 - (5*total_lops),0);
        }

        // 5 points for placing robot on first droptile (start)
        // Implicit showedUp if anything else is scored
        if (run.showedUp || score > 0) {
            score += 5
        }

        if(run.nl){
            score += 15 * run.nl.silverTape;
            score += 30 * run.nl.greenTape;
            score -= 5 * run.nl.misidentification;
        }

        final_score = Math.round(score * multiplier);

        let ret={};
        ret.raw_score = score;
        ret.score = final_score;
        ret.multiplier = multiplier;
        return ret;
    } catch (e) {
    }

}


function maze_calc_score(run) {
    let score = 0;

    let mapTiles = [];
    for (let i = 0; i < run.map.cells.length; i++) {
        let cell = run.map.cells[i];
        if (cell.isTile) {
            mapTiles[cell.x + ',' + cell.y + ',' + cell.z] = cell
        }
    }

    let victims = 0;
    let rescueKits = 0;

    for (let coord of Object.keys(run.tiles)) {
        let tile = run.tiles[coord];

        if (tile.scoredItems.speedbump && mapTiles[coord].tile.speedbump) {
            score += 5
        }
        if (tile.scoredItems.checkpoint && mapTiles[coord].tile.checkpoint) {
            score += 10
        }
        if (tile.scoredItems.ramp && mapTiles[coord].tile.ramp) {
            score += 10
        }

        if (tile.scoredItems.steps && mapTiles[coord].tile.steps) {
            score += 5
        }

        const maxKits = {
            "H": 3,
            "S": 2,
            "U": 0,
            "Heated": 1,
            "Red": 1,
            "Yellow": 1,
            "Green": 0
        };

        if (mapTiles[coord].tile.victims.top != "None") {
            if (tile.scoredItems.victims.top) {
                victims++;
                if(mapTiles[coord].tile.victims.top == "Red" || mapTiles[coord].tile.victims.top == "Yellow" || mapTiles[coord].tile.victims.top == "Green")  score += mapTiles[coord].isLinear ? 5 : 15;
                else score += mapTiles[coord].isLinear ? 10 : 30;
            }
            rescueKits += Math.min(tile.scoredItems.rescueKits.top, maxKits[mapTiles[coord].tile.victims.top])
        }
        if (mapTiles[coord].tile.victims.right != "None") {
            if (tile.scoredItems.victims.right) {
                victims++;
                if(mapTiles[coord].tile.victims.right == "Red" || mapTiles[coord].tile.victims.right == "Yellow" || mapTiles[coord].tile.victims.right == "Green")  score += mapTiles[coord].isLinear ? 5 : 15;
                else score += mapTiles[coord].isLinear ? 10 : 30;
            }
            rescueKits += Math.min(tile.scoredItems.rescueKits.right, maxKits[mapTiles[coord].tile.victims.right])
        }
        if (mapTiles[coord].tile.victims.bottom != "None") {
            if (tile.scoredItems.victims.bottom) {
                victims++;
                if(mapTiles[coord].tile.victims.bottom == "Red" || mapTiles[coord].tile.victims.bottom == "Yellow" || mapTiles[coord].tile.victims.bottom == "Green")  score += mapTiles[coord].isLinear ? 5 : 15;
                else score += mapTiles[coord].isLinear ? 10 : 30;
            }
            rescueKits += Math.min(tile.scoredItems.rescueKits.bottom, maxKits[mapTiles[coord].tile.victims.bottom])
        }
        if (mapTiles[coord].tile.victims.left != "None") {
            if (tile.scoredItems.victims.left) {
                victims++;
                if(mapTiles[coord].tile.victims.left == "Red" || mapTiles[coord].tile.victims.left == "Yellow" || mapTiles[coord].tile.victims.left == "Green")  score += mapTiles[coord].isLinear ? 5 : 15;
                else score += mapTiles[coord].isLinear ? 10 : 30;
            }
            rescueKits += Math.min(tile.scoredItems.rescueKits.left, maxKits[mapTiles[coord].tile.victims.left])
        }
    }

    score += Math.min(rescueKits, 12) * 10;

    score += Math.max((victims + Math.min(rescueKits, 12) - run.LoPs) * 10, 0);

    if (run.exitBonus) {
        score += victims * 10;
    }



    score -= Math.min(run.misidentification*5,score);

    return score
}
