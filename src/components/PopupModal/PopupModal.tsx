import React from "react";

import { IoCloseCircleOutline } from "react-icons/io5";

import './PopupModal.css';

interface PopupModalPropType {
    children: JSX.Element,
    onClickHandler: (e: React.MouseEvent<HTMLOrSVGElement>) => void
}

const PopupModal: React.FC<PopupModalPropType> = ({ children, onClickHandler }): JSX.Element => {
    return (
        <>
            <div
                className={`popup-modal-root`}
            >
                <div
                    className={`popup-modal-close-container`}
                >
                    <IoCloseCircleOutline 
                        onClick={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                            onClickHandler?.(e);
                        }}
                        size={'35'}
                        className={`popup-modal-close-container`}
                    />
                    {/* <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            onClickHandler?.(e);
                        }}
                    >
                        Close
                    </button> */}
                </div>
                <div>
                    {children}
                </div>
            </div>
        </>
    );
};

export default PopupModal;