import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'pokemonHeight',
    standalone: false
})
export class PokemonHeightPipe implements PipeTransform {
  /**
   * Convert decimeters to meters.
   * @param decimeters Pokémon height in decimeters.
   */
  transform(decimeters: number): string {
    return `${decimeters / 10}m`;
  }
}
