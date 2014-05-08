QBWebSQL
========

QBWebSQL (Query Builder for WebSQL) is a tool to make simple web sql query likes create table, insert, update, delete, and select

<h3>How to use</h3>

```javascript
WebSQL.db.open();
WebSQL.db.queryBuilder.selects(['foo', 'bar'], function() {
    WebSQL.db.queryBuilder.from('table', function() {
        WebSQL.db.queryBuilder.join('joinTable', 'table.ID = joinTable.ID', 'INNER', function() {
            WebSQL.db.queryBuilder.join('other', 'table.ID = other.ID', 'OUTER', function() {
                WebSQL.db.queryBuilder.where([{ id : 'ID', operator : '=', value : value, conjunction : 'AND' }], function () {
                    WebSQL.db.queryBuilder.query(function(sqlStatement, parameters) {
                        WebSQL.db.execute(sqlStatement, parameters, function(results) {
                            //do something
                        });
                    });
                });
            });
        });
    });
});
```

```javascript
WebSQL.db.open();
WebSQL.db.queryBuilder
    .selects(['foo', 'bar'])
    .from('table')
    .query(function(sqlStatement, parameters) {
        //do something
    }
);
```

<h3>Avialable functions</h3>
```javascript
WebSQL.db.open(DBname, DBversion, DBsize, DBdescription);
WebSQL.db.init(callback);
WebSQL.db.execute(sqlStatement, parameters, callback);
WebSQL.db.insert(table, columns, values, callback);
WebSQL.db.update(table, columns, values, where, callback);
WebSQL.db.destroy(table, where, callback);
WebSQL.db.queryBuilder.add(clausal, params, callback);
WebSQL.db.queryBuilder.select(column, callback);
WebSQL.db.queryBuilder.selects(columns, callback);
WebSQL.db.queryBuilder.from(table, callback);
WebSQL.db.queryBuilder.join(table, joinStatement, type, callback);
WebSQL.db.queryBuilder.where(where, callback);
WebSQL.db.queryBuilder.groupBy(column, callback);
WebSQL.db.queryBuilder.orderBy(column, callback);
WebSQL.db.queryBuilder.limit(limit, offset, callback);
WebSQL.db.queryBuilder.query(callback);
```

<h3>Todo</h3>
- improve performance
- improve some codes

<h3>More</h3>
See comments in source code
