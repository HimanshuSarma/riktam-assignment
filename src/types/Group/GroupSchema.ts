interface GroupSchemaType {    
    admin: string,
    isActive: boolean,
    name: string,
    users: Array<string>,
    __v?: number,
    _id: string,
    createdAt: string,
    updatedAt: string
};

export type { GroupSchemaType };