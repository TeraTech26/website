const Sequelize = require('sequelize');
module.exports = {
    Database: {//exemple of database config
        dialect: 'sqlite',
        storage: './db/database.sqlite',
        logging: false,
        define: {
            timestamps: true
        },
    },
    Model: {//exemple of model config
        user: {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            link: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            token: {
                type: Sequelize.STRING,
                allowNull: true
            }
        }
    }
};
