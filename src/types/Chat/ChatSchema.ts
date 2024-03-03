interface ChatSchema {
    _id: string,
    message: string,
    isEdited: boolean,
    roomId: string,
    likes: Array<string>,
    unlikes: Array<string>,
    createdBy: string,
    createdAt: string,
    updatedAt: string,
    __v?: number
};

export type { ChatSchema };