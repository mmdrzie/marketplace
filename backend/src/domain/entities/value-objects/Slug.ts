export class Slug {
  private constructor(readonly value: string) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new Error(`Invalid slug: ${value}`);
    }
  }

  static from(value: string): Slug {
    return new Slug(value);
  }

  static generate(text: string): Slug {
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'untitled';
    return new Slug(slug);
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
