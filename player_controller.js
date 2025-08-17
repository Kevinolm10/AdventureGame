export function movement() {
  const keys = {};

  document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
    keys[event.code] = true;
  });

  document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
    keys[event.code] = false;
  });

  // Return the keys object so it can be accessed from outside
  return keys;
}
