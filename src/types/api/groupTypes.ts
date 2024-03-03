import { GroupSchemaType } from "../Group/GroupSchema";

interface AllGroupsAuthResponseType {
    payload: {
        groups: Array<GroupSchemaType>
    }
};



export type { AllGroupsAuthResponseType };