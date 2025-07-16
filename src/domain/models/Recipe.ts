import { RecipeItem } from "./RecipeItem";

export interface Recipe {
    type: string;
    recipe_items: RecipeItem[];
} 