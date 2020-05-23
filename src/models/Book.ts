import { IBook, ID } from "../types.ts";
import { client } from "../db/client.ts";

export class Book {
  private static table: string = "books";

  private static formatRow([
    id,
    authorId,
    title,
    year,
    pages,
    genre,
    language,
    edition,
    isbn
  ]: any[]): IBook {
    return {
      id,
      authorId,
      title,
      year,
      pages,
      genre,
      language,
      edition,
      isbn
    };
  }

  static async find(authorId?: ID): Promise<IBook[]> {
    let sql = `SELECT * FROM ${this.table}`;

    if (authorId) {
      sql += " WHERE authorId = $1";
    }

    sql += " ORDER BY id;";

    const result = await client.query(
      authorId
        ? {
            text: sql,
            args: [authorId]
          }
        : sql
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

  static async insert({
    authorId,
    title,
    year,
    pages,
    genre,
    language,
    edition,
    isbn
  }: Omit<IBook, "id">): Promise<IBook> {
    const result = await client.query({
      text: `
        INSERT INTO
          ${this.table}
            (authorId, title, year, pages, genre, language, edition, isbn)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `,
      args: [authorId, title, year, pages, genre, language, edition, isbn]
    });

    return this.formatRow(result.rows[0]);
  }

  static async update({
    id,
    title,
    year,
    pages,
    genre,
    language,
    edition,
    isbn
  }: Omit<IBook, "authorId">): Promise<IBook | null> {
    const result = await client.query({
      text: `
        UPDATE ${this.table} SET
          title = $2,
          year = $3,
          pages = $4,
          genre = $5,
          language = $6,
          edition = $7,
          isbn = $8
        WHERE id = $1
        RETURNING *;
      `,
      args: [id, title, year, pages, genre, language, edition, isbn]
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
