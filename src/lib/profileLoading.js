// Bound the complete access-and-read operation so a stalled request cannot
// leave any profile screen spinning indefinitely.
export async function loadProfileWithTimeout(load) {
  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(load),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Loading your profile took too long. Please try again.')), 25000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}