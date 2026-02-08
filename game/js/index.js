import {add} from "@math";


console.log('Script starting...');
nw.Window.get().showDevTools();
window.onload = () => {
  console.log('Window loaded');
  console.log(add(2, 2));
  const container = document.getElementById('game-container');
  if (!container) {
    console.error('Container not found!');
    return;
  }
  console.log('Container found, updating content');
  container.innerHTML = `<h1 style="color: white;">Game is running! 2 + 2 = 4</h1>`;
};

console.log('Script loaded');



