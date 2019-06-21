# Multisweepercraft

Literally just multiplayer minesweeper... made to alleviate boredom in programming class

to use, make sure you have socket.io installed and run the node server... launch the site on an apache server and yer good to go

make sure you change the ip to localhost or whatever in index.html

# Known Issues:
- Browsers of all clients will freeze for no reason sometimes when restarting the game (rare)
- Players cannot join the game late because tile states are not sent to them when they join
- The first click may be a mine
