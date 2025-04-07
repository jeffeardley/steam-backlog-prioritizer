import React from 'react';
import './Footer.css';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { ProgressPresenter, IProgressView } from '../../presenters/ProgressPresenter';
import { Config } from '../../Config';

export function Footer() {
    return (
        // check if the progress bar even needs to be visible
        <div className="footer-container">
            <div className='central-footer-container'>
                Put other objects in the footer here
            </div>
            {/* <ProgressBar presenterGenerator={( view: IProgressView ) => new ProgressPresenter( view, Config.mainProgressBarService )}/> */}
        </div>
    );
}