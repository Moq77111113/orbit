import type { Optional } from '../types/utils';

export type CategoryId = string & { __type: 'CategoryId' };

export interface Category {
	id: CategoryId;
	name: string;
	description: Optional<string>;
	parentId: Optional<CategoryId>;
}

export interface CategoryHierarchy {
	category: Category;
	children: Category[];
	depth: number;
}
