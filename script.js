const SIZE = 4;

// pièces initiales
const basePieces = {
  Blanc: [
    {type:"Tour", icon:"♖"},
    {type:"Fou", icon:"♗"},
    {type:"Cavalier", icon:"♘"},
    {type:"Pion", icon:"♙", dir:-1}
  ],
  Noir: [
    {type:"Tour", icon:"♜"},
    {type:"Fou", icon:"♝"},
    {type:"Cavalier", icon:"♞"},
    {type:"Pion", icon:"♟", dir:1}
  ]
};

let board = Array.from({length:SIZE},()=>Array(SIZE).fill(null));
let current = "Blanc";
let selected = null;

// réserves
let unplaced = {
  Blanc: JSON.parse(JSON.stringify(basePieces.Blanc)),
  Noir: JSON.parse(JSON.stringify(basePieces.Noir))
};

const boardDiv = document.getElementById("board");
const panelDiv = document.getElementById("panel");
const turnDiv = document.getElementById("turn");

// ----------- affichage -------------
function drawBoard(){
  boardDiv.innerHTML="";
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const cell=document.createElement("div");
      cell.className="cell "+((r+c)%2?"dark":"light");
      cell.onclick=()=>cellClick(r,c);
      const piece=board[r][c];
      if(piece){
        cell.innerHTML=`<span class="piece">${piece.icon}</span>`;
      }
      boardDiv.appendChild(cell);
    }
  }
}

function drawPanel(){
  panelDiv.innerHTML=`<h3>Réserve :</h3>`;
  unplaced[current].forEach((p,i)=>{
    const b=document.createElement("button");
    b.textContent=p.icon+" "+p.type;
    b.onclick=()=> selectUnplaced(i);
    panelDiv.appendChild(b);
  });
  turnDiv.innerHTML=`Tour : <b>${current}</b>`;
}

// ----------- sélection --------------
function selectUnplaced(i){
  selected={from:"reserve", index:i};
}

// ----------- clic sur case ----------
function cellClick(r,c){

  // poser depuis réserve
  if(selected && selected.from==="reserve"){
    if(board[r][c]) return;
    let p = unplaced[current].splice(selected.index,1)[0];
    p={...p,color:current};      // marquer couleur
    if(p.type==="Pion" && p.dir==null)
      p.dir = current==="Blanc" ? -1 : 1;
    board[r][c]=p;
    selected=null;
    afterMove();
    return;
  }

  // sélectionner une pièce du plateau
  if(!selected && board[r][c] && board[r][c].color===current){
    selected={from:"board", r, c};
    return;
  }

  // déplacer une pièce
  if(selected && selected.from==="board"){
    const sr=selected.r, sc=selected.c;
    const piece=board[sr][sc];
    if(validMove(piece,sr,sc,r,c)){
      // gestion capture -> retour dans réserve
      if(board[r][c] && board[r][c].color!==piece.color){
        const cap = board[r][c];
        const clean = {type:cap.type, icon:cap.icon};
        if(cap.type==="Pion") clean.dir = cap.dir;
        unplaced[cap.color].push(clean);
      }

      board[r][c]=piece;
      board[sr][sc]=null;

      // pion inverse direction au bord
      if(piece.type==="Pion"){
        if(r===0 || r===SIZE-1){
          piece.dir *= -1;
        }
      }

      selected=null;
      afterMove();
    }
  }
}

// --------- après un coup ----------
function afterMove(){
  if(checkWin(current)){
    alert(current+" gagne !");
  }else{
    current = current==="Blanc" ? "Noir" : "Blanc";
  }
  refresh();
}

// -------- validation des mouvements -------
function validMove(piece,sr,sc,r,c){
  if(sr===r && sc===c) return false;

  // pas capturer allié
  if(board[r][c] && board[r][c].color===piece.color) return false;

  const dr=r-sr, dc=c-sc;

  switch(piece.type){

    case "Tour":
      if(dr!==0 && dc!==0) return false;
      return pathClear(sr,sc,r,c);

    case "Fou":
      if(Math.abs(dr)!==Math.abs(dc)) return false;
      return pathClear(sr,sc,r,c);

    case "Cavalier":
      return (Math.abs(dr)===2 && Math.abs(dc)===1) ||
             (Math.abs(dr)===1 && Math.abs(dc)===2);

    case "Pion":
      // déplacement simple
      if(dc===0 && dr===piece.dir && !board[r][c]) return true;

      // capture diagonale dans direction actuelle
      if(Math.abs(dc)===1 && dr===piece.dir && board[r][c]) return true;

      return false;
  }
}

// -------- chemin libre (tour/fou) --------
function pathClear(sr,sc,r,c){
  let dr=Math.sign(r-sr), dc=Math.sign(c-sc);
  let rr=sr+dr, cc=sc+dc;
  while(rr!==r || cc!==c){
    if(board[rr][cc]) return false;
    rr+=dr; cc+=dc;
  }
  return true;
}

// -------- condition de victoire : aligner 4 -------
function checkWin(color){

  // lignes
  for(let r=0;r<4;r++){
    if([0,1,2,3].every(c=>board[r][c] && board[r][c].color===color))
      return true;
  }

  // colonnes
  for(let c=0;c<4;c++){
    if([0,1,2,3].every(r=>board[r][c] && board[r][c].color===color))
      return true;
  }

  // diagonales
  if([[0,0],[1,1],[2,2],[3,3]]
     .every(([r,c])=>board[r][c] && board[r][c].color===color)) return true;

  if([[0,3],[1,2],[2,1],[3,0]]
     .every(([r,c])=>board[r][c] && board[r][c].color===color)) return true;

  return false;
}

function refresh(){
  drawBoard();
  drawPanel();
}

refresh();