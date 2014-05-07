/**
 * This file is part of QBWebSQL
 *
 * (c) Muhamad Surya Iksanudin<surya.kejawen@gmail.com>
 *
 * @author : Muhamad Surya Iksanudin
 **/
(function (WebSQL) {
    //Root class
    WebSQL.db = {};

    //Define default properties
    WebSQL.db.name = "sanisphere";
    WebSQL.db.version = "1";
    WebSQL.db.size = 50 * 1024 * 1024;//50 MB
    WebSQL.db.description = "Sanisphere pharmacy";
    WebSQL.db.connection = null;

    //Open database
    /**
     * @param string @default 'sanisphere'
     * @param string @default '1'
     * @param integer @default 50MB @example : 5 * 1024 * 1024 = 5MB
     * @param string @default 'Sanisphere pharmacy'
     *
     * @return WebSQL.db.connection object
     **/
    WebSQL.db.open = function (name, version, size, description) {
        //Override any values
        if (undefined !== name) {
            WebSQL.db.name = name;
        }

        if (undefined !== version) {
            WebSQL.db.version = version;
        }

        if (undefined !== size) {
            WebSQL.db.size = size;
        }

        if (undefined !== description) {
            WebSQL.db.description = description;
        }

        //Now we ready to make connection
        try {
            WebSQL.db.connection = openDatabase(WebSQL.db.name, WebSQL.db.version, WebSQL.db.description, WebSQL.size);

            return WebSQL.db.connection;
        } catch (e) {
            console.log(e.message);
        }
    }

    //Transaction handle
    /**
     * @param string
     * @param array
     * @param callable function
     **/
    WebSQL.db.execute = function (sqlStatement, parameters, callback) {
        try {
            WebSQL.db.connection.transaction(function (trx) {
                trx.executeSql(sqlStatement, parameters,
                    function (sqlTransaction, sqlResultSet) {
                        if(callback && "function" === typeof(callback)){
                            callback(sqlTransaction, sqlResultSet);
                        }
                    },
                    function(sqlTransaction, sqlError) {
                        console.log(sqlError.message);
                    }
                );
            });
        } catch (e) {
            console.log(e.message);
        }
    }

    //Insert utility
    /**
     * @param array
     * @param array
     * @param callable function
     **/
    WebSQL.db.insert = function (table, columns, values, callback) {
        try {
            var parameters = "";
            for (var i = 0; i < columns.length; i++) {
                parameters += "? ,";
            }
            //trim space and comma from start and end of string
            parameters = parameters.replace(/([\s,]+|[,\s])+$/,'');

            var sqlStatement = "INSERT INTO " + table+ "(" + columns.join(', ') + ") VALUES (" + parameters +") ";

            WebSQL.db.execute(sqlStatement, values, callback);
        } catch (e) {
            console.log(e.message);
        }
    }

    //Update utility
    /**
     * @param string
     * @param array
     * @param array
     * @param array
     * @param callable function
     **/
    WebSQL.db.update = function (table, columns, values, where, callback) {
        //@todo improve where statement to support multiple clausal of where
        try {
            var parameters = "";
            for (var i = 0; i < columns.length; i++) {
                parameters += columns[i] + " = ?, ";
            }
            //trim space and comma from start and end of string
            parameters = parameters.replace(/([\s,]+|[,\s])+$/,'');

            var sqlStatement = "UPDATE " + table + " SET "+ parameters +" WHERE " + where.id + " " + where.operator + " " + where.value;

            WebSQL.db.execute(sqlStatement, values, callback);
        } catch (e) {
            console.log(e.message);
        }
    }

    //Delete utility
    /**
     * @param string
     * @param array
     * @param callable function
     **/
    WebSQL.db.destroy = function(table, where, callback) {
        //@todo improve where statement to support multiple clausal of where
        try {
            var sqlStatement = "DELETE FROM " + table + " WHERE " + where.id + " " + where.operator + " ?";

            WebSQL.db.execute(sqlStatement, [where.value], callback);
        } catch (e) {
            console.log(e.message);
        }
    }

    //Select utilities
    WebSQL.db.queryBuilder = {};
    WebSQL.db.queryBuilder.fields = [];
    WebSQL.db.queryBuilder.froms = [];
    WebSQL.db.queryBuilder.joins = [];
    WebSQL.db.queryBuilder.wheres = [];
    //Add selection
    /**
     * @param string
     **/
    WebSQL.db.queryBuilder.select = function (column, callback) {
        WebSQL.db.queryBuilder.fields.push(column);

        if(callback && "function" === typeof(callback)){
            callback();
        }
    }
    /**
     * @param array
     **/
     WebSQL.db.queryBuilder.selects = function (columns, callback) {
        WebSQL.db.queryBuilder.fields = WebSQL.db.queryBuilder.fields.concat(columns);

        if(callback && "function" === typeof(callback)){
            callback();
        }
     }
    //Add from
    /**
     * @param string
     */
    WebSQL.db.queryBuilder.from = function (table, callback) {
        WebSQL.db.queryBuilder.froms.push(table);

        if(callback && "function" === typeof(callback)){
            callback();
        }
    }
    //Add join
    /**
     * @param string
     */
    WebSQL.db.queryBuilder.join = function (table, joinStatement, type, callback) {
        WebSQL.db.queryBuilder.joins[table] = [type, joinStatement];

        if(callback && "function" === typeof(callback)){
            callback();
        }
    }
    //Add where
    /**
     * @param array
     **/
    WebSQL.db.queryBuilder.where = function (where, callback) {
        for (var i = 0; i < where.length; i++) {
            if (0 === i) {
                WebSQL.db.queryBuilder.wheres[where[i].id] = ["", where[i].operator, where[i].value];
            } else {
                WebSQL.db.queryBuilder.wheres[where[i].id] = [where[i].conjunction, where[i].operator, where[i].value];
            }
        }

        if(callback && "function" === typeof(callback)){
            callback();
        }
    }
    //Compile query
    /**
     * @return string
     **/
    WebSQL.db.queryBuilder.query = function(callback) {
        var parameters = [];
        //Compile Select
        var query = "SELECT ";
        for (var i = 0; i < WebSQL.db.queryBuilder.fields.length; i++) {
            query += WebSQL.db.queryBuilder.fields[i] + ", ";
        }
        //trim space and comma from start and end of string
        query = query.replace(/([\s,]+|[,\s])+$/,'');
        //Compile From
        query += " FROM ";
        for (var i = 0; i < WebSQL.db.queryBuilder.froms.length; i++) {
            query += WebSQL.db.queryBuilder.froms[i] + ", ";
        }
        //trim space and comma from start and end of string
        query = query.replace(/([\s,]+|[,\s])+$/,'');
        query += " ";//make sure we have extra space in the end of string
        //Compile Join
        for (var key in WebSQL.db.queryBuilder.joins) {
            if (WebSQL.db.queryBuilder.joins.hasOwnProperty(key)) {
                query += WebSQL.db.queryBuilder.joins[key][0] + " JOIN ";
                query += key + " ON ";
                query += WebSQL.db.queryBuilder.joins[key][1] + " ";
            }
        }
        //trim space from start and end of string
        query = query.trim();
        //Compile Where
        query += " WHERE ";
        var where = "";
        for (var key in WebSQL.db.queryBuilder.wheres) {
            if (WebSQL.db.queryBuilder.wheres.hasOwnProperty(key)) {
                where += " " + WebSQL.db.queryBuilder.wheres[key][0] + " ";
                where += key + " ";
                where += WebSQL.db.queryBuilder.wheres[key][1] + "?";
                parameters.push(WebSQL.db.queryBuilder.wheres[key][2]);
            }
        }
        //trim space from start and end of string
        where = where.trim();
        //Now we have real sql statement
        query += where;
        if(callback && "function" === typeof(callback)){
            callback(query, parameters);
        }
    }
}(window.WebSQL = window.WebSQL || {}));
