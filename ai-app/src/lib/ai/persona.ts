export interface Persona {
  name: string;
  gender: "male" | "female";
}

const DEFAULT_PERSONAS: Persona[] = [
  { name: "Fatima Begum", gender: "female" },
  { name: "Abdullah Hasan", gender: "male" },
  { name: "Shahin Akter", gender: "female" },
  { name: "Rafiq Islam", gender: "male" },
  { name: "Nasima Khatun", gender: "female" },
  { name: "Jahangir Alam", gender: "male" },
  { name: "Parvin Sultana", gender: "female" },
  { name: "Kamal Hossain", gender: "male" },
  { name: "Rokeya Begum", gender: "female" },
  { name: "Shafiqur Rahman", gender: "male" },
];

let personaPool: { persona: Persona; inUse: boolean }[] = DEFAULT_PERSONAS.map((p) => ({
  persona: p,
  inUse: false,
}));

export function getPersona(phone?: string): Persona {
  if (phone) {
    const index = phone.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % personaPool.length;
    return personaPool[index].persona;
  }
  const available = personaPool.find((p) => !p.inUse);
  if (available) {
    available.inUse = true;
    return available.persona;
  }
  const fallback = personaPool[Math.floor(Math.random() * personaPool.length)];
  return fallback.persona;
}

export function releasePersona(persona: Persona): void {
  const entry = personaPool.find((p) => p.persona.name === persona.name);
  if (entry) entry.inUse = false;
}
