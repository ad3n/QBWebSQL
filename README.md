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
WebSQL.insert(table, columns, values, callback);
WebSQL.update(table, columns, values, where, callback);
WebSQL.destroy(table, where, callback);
```
