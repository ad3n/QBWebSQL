/**
 * This file is part of QBWebSQL
 *
 * (c) Muhamad Surya Iksanudin<surya.kejawen@gmail.com>
 *
 * @author : Muhamad Surya Iksanudin
 *
 * @todos:
 * - improve performance
 * - improve codes
 **/
(function (WebSQL) {
    //Root class
    WebSQL.db = {};

    //Define default properties
    WebSQL.db.name = "websql";
    WebSQL.db.version = "1.0";
    WebSQL.db.size = 5 * 1024 * 1024;//5 MB
    WebSQL.db.description = "WebSQL Database";
    WebSQL.db.connection = null;

    //Open database
    /**
     * @param string @default 'websql'
     * @param string @default '1.0'
     * @param integer @default 5MB @example : 5 * 1024 * 1024 = 5MB
     * @param string @default 'WebSQL Database'
     *
     * @return WebSQL.db object
     **/
    WebSQL.db.open = function (name, version, size, description) {
        //Override any values
        if (name) {
            WebSQL.db.name = name;
        }

        if (version) {
            WebSQL.db.version = version;
        }

        if (size) {
            WebSQL.db.size = size;
        }

        if (description) {
            WebSQL.db.description = description;
        }

        //Now we ready to make connection
        try {
            WebSQL.db.connection = openDatabase(WebSQL.db.name, WebSQL.db.version, WebSQL.db.description, WebSQL.size);

            return WebSQL.db;
        } catch (e) {
            console.log(e.message);
        }
    }

    //Create bootstrap function
    WebSQL.db.init = function(callback) {
        WebSQL.db.open();
        if(callback && "function" === typeof(callback)){
            callback();
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

        return WebSQL.db;
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

        return WebSQL.db;
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

        return WebSQL.db;
    }

    //Delete utility
    /**
     * @param string
     * @param array
     * @param callable function
     **/
    WebSQL.db.destroy = function(table, where, callback) {
        try {
            var sqlStatement = "DELETE FROM " + table + " WHERE " + where.id + " " + where.operator + " ?";

            WebSQL.db.execute(sqlStatement, [where.value], callback);
        } catch (e) {
            console.log(e.message);
        }

        return WebSQL.db;
    }

    //Select utilities
    WebSQL.db.queryBuilder = {};
    WebSQL.db.queryBuilder.fields = [];
    WebSQL.db.queryBuilder.froms = [];
    WebSQL.db.queryBuilder.joins = [];
    WebSQL.db.queryBuilder.wheres = [];
    WebSQL.db.queryBuilder.groups = [];
    WebSQL.db.queryBuilder.havings = [];
    WebSQL.db.queryBuilder.orders = [];
    WebSQL.db.queryBuilder.per = null;
    WebSQL.db.queryBuilder.offset = null;

    //Create hook
    /**
     * @param string sql clausal
     * @param string parameter
     **/
    WebSQL.db.queryBuilder.add = function(method, params, callback) {
        method = "WebSQL.db.queryBuilder." + method + "('" + params + "')";
        eval(method);

        if(callback && "function" === typeof(callback)){
            callback();
        }

        return WebSQL.db.queryBuilder;
    }

    //Add selection
    /**
     * @param string
     **/
    WebSQL.db.queryBuilder.select = function (column, callback) {
        WebSQL.db.queryBuilder.fields.push(column);

        if(callback && "function" === typeof(callback)){
            callback();
        }

        return WebSQL.db.queryBuilder;
    }
    /**
     * @param array
     **/
    WebSQL.db.queryBuilder.selects = function (columns, callback) {
        WebSQL.db.queryBuilder.fields = WebSQL.db.queryBuilder.fields.concat(columns);

        if(callback && "function" === typeof(callback)){
            callback();
        }

        return WebSQL.db.queryBuilder;
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

        return WebSQL.db.queryBuilder;
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

        return WebSQL.db.queryBuilder;
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

        return WebSQL.db.queryBuilder;
    }

    //Add Group By
    /**
     * @param string
     **/
    WebSQL.db.queryBuilder.groupBy = function(column, callback) {
        WebSQL.db.queryBuilder.groups.push(column);

        if(callback && "function" === typeof(callback)){
            callback();
        }

        return WebSQL.db.queryBuilder;
    }

    //Add Order By
    /**
     * @param string
     **/
    WebSQL.db.queryBuilder.orderBy = function(column, callback) {
        WebSQL.db.queryBuilder.orders.push(column);

        if(callback && "function" === typeof(callback)){
            callback();
        }

        return WebSQL.db.queryBuilder;
    }
    //Add Limit
    /**
     * @param integer
     * @param integer
     **/
    WebSQL.db.queryBuilder.limit = function(limit, offset, callback) {
        console.log('a');
        WebSQL.db.queryBuilder.per = limit;

        if (offset) {
            WebSQL.db.queryBuilder.offset = offset;
        }

        if(callback && "function" === typeof(callback)){
            callback();
        }

        return WebSQL.db.queryBuilder;
    }

    //Compile query
    /**
     * @return string
     *
     * SELECT
     * FROM
     * JOIN
     * WHERE
     * GROUP BY
     * HAVING
     * ORDER BY
     * LIMIT
     * OFFSET
     **/
    WebSQL.db.queryBuilder.query = function(callback) {
        console.log(WebSQL.db.queryBuilder.per);
        var query = "";
        var parameters = [];
        //Compile Select
        if (WebSQL.db.queryBuilder.fields.length > 0) {
            query += "SELECT ";
            for (var i = 0; i < WebSQL.db.queryBuilder.fields.length; i++) {
                query += WebSQL.db.queryBuilder.fields[i] + ", ";
            }
            //trim space and comma from start and end of string
            query = query.replace(/([\s,]+|[,\s])+$/,'');
        } else {
            query += "SELECT *";
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
        if (WebSQL.db.queryBuilder.wheres > 0) {
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
        }
        //Compile Group By
        if (WebSQL.db.queryBuilder.groups > 0) {
            query += " GROUP BY ";
            for (var i = 0; i < WebSQL.db.queryBuilder.groups.length; i++) {
                query += WebSQL.db.queryBuilder.groups[i] + ", ";
            }
            //trim space and comma from start and end of string
            query = query.replace(/([\s,]+|[,\s])+$/,'');
        }
        //Compile Order By
        if (WebSQL.db.queryBuilder.orders > 0) {
            query += " ORDER BY ";
            for (var i = 0; i < WebSQL.db.queryBuilder.orders.length; i++) {
                query += WebSQL.db.queryBuilder.orders[i] + ", ";
            }
            //trim space and comma from start and end of string
            query = query.replace(/([\s,]+|[,\s])+$/,'');
        }
        //Compile LIMIT
        if (WebSQL.db.queryBuilder.per) {
            query += " LIMIT " + WebSQL.db.queryBuilder.per + " ";
            if (WebSQL.db.queryBuilder.offset) {
                query += "OFFSET " + WebSQL.db.queryBuilder.offset;
            } else {
                query += "OFFSET 0";
            }
        }
        //make sure to remove all query builder value
        WebSQL.db.queryBuilder.fields = [];
        WebSQL.db.queryBuilder.froms = [];
        WebSQL.db.queryBuilder.joins = [];
        WebSQL.db.queryBuilder.wheres = [];
        WebSQL.db.queryBuilder.groups = [];
        WebSQL.db.queryBuilder.havings = [];
        WebSQL.db.queryBuilder.orders = [];
        WebSQL.db.queryBuilder.per = null;
        WebSQL.db.queryBuilder.offset = null;

        if(callback && "function" === typeof(callback)){
            callback(query, parameters);
        }
    }
}(window.WebSQL = window.WebSQL || {}));
