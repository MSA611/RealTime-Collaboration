setInterval(async () => {
  try {
    const res = await fetch("https.collaboration-gwsu.onrender.com/");
  } catch (error) {
    console.log(error.message);
  }
}, 15 * 60 * 1000);