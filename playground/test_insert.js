const pool = require('../dao/pool');

module.exports = (req, res) => {

    let insert_string = `
        INSERT INTO users(firstname, lastname, mobile_no, username, password)
        VALUES($1, $2, $3, $4, $5) RETURNING ID ;
    `;

    pool.query(insert_string, ['ifandi2', 'salim2', '0123456789', 'ifandi2', 'test122'])
        .then((result) => {
            console.log('RESULT INSERT: ', result);
        })
        .catch((error) => {
            console.log('EROR INSERT: ', error);
        });

};
