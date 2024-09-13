In NestJS with Mongoose, the `@Prop()` decorator is used to define schema properties for a MongoDB collection. It can accept various options to customize how the property behaves within the schema. Here are some common options you can use with `@Prop()`:

### Basic Property Options

1. **Type**  
   Specify the data type of the property.
   ```ts
   @Prop({ type: String })
   firstName: string;
   ```

2. **Required**  
   Make the property required.
   ```ts
   @Prop({ required: true })
   firstName: string;
   ```

3. **Default**  
   Set a default value for the property.
   ```ts
   @Prop({ default: "John" })
   firstName: string;
   ```

4. **Unique**  
   Ensure that the property has unique values.
   ```ts
   @Prop({ unique: true })
   email: string;
   ```

5. **Index**  
   Create an index on the property.
   ```ts
   @Prop({ index: true })
   email: string;
   ```

6. **Enum**  
   Restrict the property to a specific set of values (like enums).
   ```ts
   @Prop({ enum: ["Admin", "User", "Instructor"], default: "User" })
   role: string;
   ```

7. **Min/Max Length**  
   Define minimum and maximum length for strings.
   ```ts
   @Prop({ minlength: 3, maxlength: 20 })
   firstName: string;
   ```

8. **Validate**  
   Add a custom validator.
   ```ts
   @Prop({ validate: (value: string) => value.length > 3 })
   password: string;
   ```

9. **Ref (For Relationships)**  
   Reference another schema (for relationships).
   ```ts
   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
   userId: User;
   ```

Here's an example with multiple options:

```ts
@Schema()
export class AuthSchema {
  @Prop({ required: true, minlength: 3 })
  firstName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ enum: ["Admin", "User"], default: "User" })
  role: string;
}
```

This setup allows for more control and validation over the fields in your MongoDB schema.