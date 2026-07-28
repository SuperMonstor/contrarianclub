// The kit: the pieces every poster is built from, and the only things a work
// should import out of core. Brand-level and event-agnostic by construction.
//
// If a piece needs something that is not here, the first answer is to build it
// inside the work's own folder. It only graduates into the kit once a second
// piece wants it and the shape has stopped moving.
export { PosterFrame } from "./PosterFrame";
export { Lockup } from "./Lockup";
export { Art, ArtTone } from "./Art";
