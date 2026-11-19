// One palette per catalog-verified album, in the order of AilleursMusicCovers.
// Dark papers keep the same readable ink; the accent and geometric detail follow each sleeve.
window.AilleursAlbumThemes = [
  ['#211925','#332437','#f4bb7d','tiles'],       // MM..FOOD
  ['#151b2b','#28344c','#a9d7e2','halo'],        // Homogenic
  ['#182632','#263a48','#a9d5ef','lines'],       // Kind of Blue
  ['#202326','#30383c','#e1b98e','grain'],       // Dummy
  ['#1b2929','#314345','#bce4ba','waves'],       // 浮躁
  ['#23242a','#34394b','#e5d9b4','peaks'],       // Kid A
  ['#222326','#343536','#f2a267','mask-registration'], // Madvillainy · monochrome photograph, orange corner
  ['#132b3a','#21485a','#a8dbd4','waves'],       // Long Season
  ['#34202d','#523043','#f2b5bc','frame'],       // IGOR
  ['#241f1d','#3d332c','#eabf84','donuts-sleeve'], // Donuts · smile photograph, alternate illustrated LP
  ['#1c2730','#293b4a','#b8d1da','grain'],       // Mezzanine
  ['#28212b','#40334c','#e0bcdd','rings'],       // Songs in the Key of Life
  ['#292522','#41362d','#efc493','tiles'],       // Operation: Doomsday
  ['#262526','#3a3737','#efc2aa','frame'],       // To Pimp a Butterfly
  ['#201f28','#363746','#d1c8ed','waves'],       // Love Deluxe
  ['#25213a','#38315e','#d3c8fd','grid'],        // Discovery
  ['#2c2923','#454136','#e2d2a6','grain'],       // Things Fall Apart
  ['#271d23','#422d35','#f3c5ba','lines'],       // Back to Black
  ['#222b22','#394735','#d6e4b0','rings'],       // Spirit of Eden
  ['#30271f','#4a382c','#f2d7a7','frame'],       // Velvet Underground
  ['#171c29','#29364a','#f5c8aa','rainbows-ink'], // In Rainbows · Donwood's liquid mark-making
  ['#182638','#28435b','#b9d9f5','lines'],       // Blue
  ['#302922','#4a3d2d','#e8d8b0','frame'],       // Miseducation
  ['#272324','#423332','#e2c1aa','grain'],       // Voodoo
  ['#202b35','#35495a','#e1e5e3','halo'],        // Vespertine
  ['#22232d','#393b4c','#bcd8e1','rings'],       // Selected Ambient Works
  ['#252322','#403b36','#ded0bd','grain'],       // Black Messiah
  ['#30223b','#4b3555','#e7bddd','waves'],       // Heaven Or Las Vegas
  ['#2b2621','#463a2f','#e6d6be','lines'],       // Chet Baker Sings
  ['#242329','#393641','#edc9af','frame']        // A Love Supreme
].map(([paper,panel,accent,motif])=>({paper,panel,accent,motif}));
