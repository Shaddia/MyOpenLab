import React from 'react';
import '../styles/home.css';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faCompass,
    faUser,
    faGear,
    faUserCircle,
    faHeart,
    faStar,
    faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import Layout from './layout';

const Home = () => {
    return (
        <Layout>
                <div className="top-bar">
                    <h2 class="section-title">Publicaciones</h2>
                    <div className="underline" />
                </div>

                <div className="post-creator">
                    <textarea placeholder="¿Sobre qué quieres hablar?"></textarea>
                    <button>Publicar</button>
                </div>

                <div className="posts">
                    <h3>Mis publicaciones</h3>
                    <div className="post-card">Este es un post de ejemplo...</div>
                </div>
        </Layout>
    );
};

export default Home;
