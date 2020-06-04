import { Request, Response } from 'express';
import knex from '../database/connection';   

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));


        //buscando todos os pontos que tem pelo menos um dos items filtrados    
        const points = await knex('points')
            .join('point_item', 'point_id', '=', 'point_item.point_id')
            .whereIn('point_item.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return response.json(points);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message:'Point not found.' }); 
        }
        
        const items = await knex('items')
           .join('point_item', 'item_id', '=', 'point_item.item_id' )
           .where('point_item.point_id', id)
           .select('items.title');

        return response.json({ point, items });
    }

    async create(request: Request, response: Response) {
        const { 
            name, 
            email,
            whatsapp,
            latitude,
            longitude, 
            city, 
            uf, 
            items,
        } = request.body;
    
        const trx = await knex.transaction();
    
        const point = {
            image: 'image-fake',
            name, 
            email,
            whatsapp,
            latitude,
            longitude, 
            city, 
            uf, 
        };

        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds [0]
    
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        });
    
        await trx('point_Item').insert(pointItems);

        await trx.commit();
    
        return response.json({ 
            id: point_id,
            ...point,
        });
    
    }
}

export default PointsController;