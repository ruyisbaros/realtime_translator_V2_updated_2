// Handle client registration
socket.on("register", (data) => {
  const { clientType, id } = data;
  const client = { id, socketId: socket.id, clientType };
  clients.unshift(client);
  console.log("Registered client:", client);
  //io.emit("updateClients", clients); // Notify all clients of the update
});
""" # Process the video and generate transcriptions and subtitles
        result = await process_video(file_path, whisper_model, fb_model,
                                     fb_tokenizer, selected_languages, action_type, subtitle_format, socketio) """