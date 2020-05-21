import { IBook, ID } from "../types.ts";
import { client } from "../db/client.ts";

export class Book {
  private static table: string = "books";

  private static formatRow([id, title, year]: any[]): IBook {
    return {
      id,
      title,
      year
    };
  }

  static async find(): Promise<IBook[]> {
    const result = await client.query(
      `SELECT * FROM ${this.table} ORDER BY id;`
    );

    return result.rows.map(row => this.formatRow(row));
  }

  static async findOne(id: ID): Promise<IBook | null> {
    const result = await client.query({
      text: `SELECT * FROM ${this.table} WHERE id = $1 LIMIT 1;`,
      args: [id]
    });

    const [row] = result.rows;
    if (!row) return null;

    return this.formatRow(row);
  }

  static async insert(args: Omit<IBook, "id">): Promise<IBook> {
    const result = await client.query({
      text: `INSERT INTO ${this.table}(title, year) VALUES($1, $2) RETURNING *;`,
      args: [args.title, args.year]
    });

    return this.formatRow(result.rows[0]);
  }

  static async update({ id, title, year }: IBook): Promise<IBook | null> {
    const result = await client.query({
      text: `UPDATE ${this.table} SET title = $2, year = $3 WHERE id = $1 RETURNING *;`,
      args: [id, title, year]
    });

    const [row] = result.rows;
    if (!row) return null;

    return this.formatRow(row);
  }

  static async delete(id: ID): Promise<void> {
    await client.query({
      text: `DELETE FROM ${this.table} WHERE id = $1;`,
      args: [id]
    });
  }
}