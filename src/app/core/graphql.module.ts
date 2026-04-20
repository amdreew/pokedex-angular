import { NgModule, inject } from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from 'src/environments/environment';

@NgModule({
  providers: [
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: environment.pokeApiGraphQL }),
        cache: new InMemoryCache(),
      };
    }),
  ],
})
export class GraphQLModule {}
