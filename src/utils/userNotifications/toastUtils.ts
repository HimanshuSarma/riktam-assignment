import { toast } from 'react-toastify';

const successToastMessage = (message: string) => {
    toast.success(message || `Success!`, {
        type: 'success',
    });
};

const errorToastMessage = (message: string) => {
    toast.error(message || 'Some error occured!', {
        type: 'error',
    });
}

export { successToastMessage, errorToastMessage };