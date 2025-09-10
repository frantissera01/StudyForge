// src/core/storage.js

/** Timestamp actual en ms */
export const now = () => Date.now();

/** Comienzo del día local (00:00) en ms */
export const todayStart = () => new Date(new Date().toDateString()).getTime();
