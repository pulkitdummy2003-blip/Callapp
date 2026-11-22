const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    room = String(room || "").trim().slice(0, 50);
    if (!room) return;
    const existing = [...(io.sockets.adapter.rooms.get(room) || [])];
    socket.join(room);
    socket.data.room = room;
    // नए व्यक्ति को कमरे में पहले से मौजूद लोगों की लिस्ट भेजो
    socket.emit("peers", existing);
  });

  // एक व्यक्ति से दूसरे तक कनेक्शन का संदेश पहुँचाओ
  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    if (socket.data.room) socket.to(socket.data.room).emit("left", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("चल रहा है: http://localhost:" + PORT));
