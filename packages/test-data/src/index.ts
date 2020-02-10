import { schema } from 'normalizr';
import { v4 as uuid } from 'uuid';

export const user = new schema.Entity('users');
export const comment = new schema.Entity('comments', {
    commenter: user,
});
export const article = new schema.Entity('articles', {
    author: user,
    comments: [comment],
});

export interface User {
    id: string;
    name: string;
}

export interface Comment {
    id: string;
    message: string;
    commenter: User;
}

export interface Article {
    id: string;
    title: string;
    author: User;
    comments: Comment[];

    test?: number;
}

export const generateComments = (commentCount = 100) => {
    const comments: Comment[] = [];

    for (let i = 0; i < commentCount; i += 1) {
        comments.push({
            id: uuid(),
            message: `Comment nr${i}`,
            commenter: {
                id: '2',
                name: 'Nicole',
            },
        });
    }

    return comments;
};

export const generateArticles = (articleCount = 100, commentCount = 100) => {
    const articles: Article[] = [];

    for (let i = 0; i < articleCount; i += 1) {
        articles.push({
            id: uuid(),
            author: {
                id: '1',
                name: 'Paul',
            },
            title: `My awesome blog post nr${i}`,
            comments: generateComments(commentCount),
        });
    }

    return articles;
};
