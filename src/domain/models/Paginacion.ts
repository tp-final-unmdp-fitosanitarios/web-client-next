export interface Paginacion {
    total_pages: number;
    total_elements: number;
    first: boolean;
    last: boolean;
    size: number;
    number: number;
    number_of_elements: number;
    empty: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    pageable: {
      offset: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      page_number: number;
      page_size: number;
      paged: boolean;
      unpaged: boolean;
    };
  }
  
