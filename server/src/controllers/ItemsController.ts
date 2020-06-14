import knex from '../database/connection';
import { Request, Response } from 'express';


class ItemsController {
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');
        console.log('items', items)
        const serializedItems = items.map(item => {
            return { 
                id: item.id,
                title: item.title,
                image_url: `http://192.168.15.17:3333/uploads/${item.image}`,
            };
        });
        
        return response.json(serializedItems);
    }
};

export default ItemsController;