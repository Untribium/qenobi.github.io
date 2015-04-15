var Query = (function() {

	Query.prototype.projection;
	Query.prototype.distinct;
	Query.prototype.relation;
	Query.prototype.condition;
	Query.prototype.groupBy;

	Query.prototype.cardinality;

	function Query(relation, condition) {
		this.relation = relation;
		this.condition = condition;

		this.distinct = false;

		this.groupBy = [];
		this.projection = [];
	}

	Query.prototype.getAttributes = function() {
		if(this.projection.length) {
			return this.projection;
		}
		else {
			return this.relation.getAttributes();
		}
	}

	Query.prototype.getRelation = function() { return this.relation; }

	Query.prototype.setRelation = function(relation) {
		this.relation = relation;
	}

	Query.prototype.getCondition = function() { return this.condition; }

	Query.prototype.setCondition = function(condition) {
		this.condition = condition;
	}

	Query.prototype.getCardinality = function() { return this.cardinality; }

	Query.prototype.setCardinality = function(cardinality) {
		this.cardinality = cardinality;
	}

	Query.prototype.getDistinct = function() { return this.distinct; }

	Query.prototype.setDistinct = function(flag) {
		this.distinct = flag;
	}

	Query.prototype.getQuery = function(indent) {
		var ind = Util.indent(indent || 0);
		var ind_ = ind+'  ';
		var result = '';

		result += ind+'SELECT';
		result += this.distinct ? ' DISTINCT' : '';
		result += '\n'+this.getProjection(indent+1);
		result += '\n'+ind+'FROM\n'+ind_+this.relation.getQuery(indent+1);
		if(this.condition){
			result += '\n'+ind+'WHERE\n'+ind_+this.condition.getQuery(indent+1);
		}
		if(this.groupBy.length) {
			result += '\n'+ind+'GROUP BY\n'+this.getGroupBy(indent+1);
		}

		return result;

	}

	Query.prototype.getProjection = function(indent) {
		if(this.projection.length) {
			var ind = Util.indent(indent);
			var result = '';

			for(var i = 0; i < this.projection.length; i++) {
				result += ((result) ? ',\n' : '')+ind+this.projection[i].getProjection();
			}

			return result;
		}
		else {
			return this.relation.getProjection(indent);
		}
	}

	Query.prototype.getGroupBy = function(indent) {
		if(this.groupBy.length) {
			var ind = Util.indent(indent);
			var result = '';

			for(var i = 0; i < this.groupBy.length; i++) {
				result += ((result) ? ',\n' : '')+ind+this.groupBy[i].getQuery();
			}

			return result;
		}
		else {
			return null;
		}
	}

	Query.prototype.clone = function() {
		var result = new Query(this.relation.clone(), this.condition);
		result.setCardinality(this.cardinality);
		result.setDistinct(this.distinct);

		//projection ignored, will always be null on clone
		//condition not cloned because new attributes not available (ugly, but works)

		return result;
	}

	return Query;

})();


var Set = (function() {

	Set.prototype.set1;
	Set.prototype.set2;

	Set.prototype.type;

	function Set(set1, set2, type) {
		this.set1 = set1;
		this.set2 = set2;
		this.type = type;
	}

	Set.prototype.getQuery = function(indent) {
		var ind = Util.indent(indent || 0);
		var result = '';
		result += this.set1.getQuery(indent+1);
		result += '\n'+ind+this.type.getValue()+'\n';
		result += this.set2.getQuery(indent+1);
		return result;
	}

	Set.prototype.getAttributes = function() {
		return this.set1.getAttributes();
	}

	Set.prototype.clone = function() {
		//no clone required
		return this;
	}

	return Set;

})();


var AbstractRelation = (function() {

	AbstractRelation.prototype.attributes;
	AbstractRelation.prototype.alias;

	function AbstractRelation(alias) {
		this.alias = alias;

		this.attributes = [];
	}

	AbstractRelation.prototype.getAttributes = function() { return this.attributes; }

	AbstractRelation.prototype.setAttributes = function(attributes) {
		this.attributes = attributes;
	} 

	AbstractRelation.prototype.addAttribute = function(attribute) {
		this.attributes.push(attribute);
	}

	AbstractRelation.prototype.getAlias = function() { return this.alias; }

	AbstractRelation.prototype.setAlias = function(alias) {
		this.alias = alias;
	}

	AbstractRelation.prototype.getProjection = function(indent) {
		var aliased = false;

		for(var i = 0; i < this.attributes.length; i++) {
			if(this.attributes[i].getAlias()) {
				aliased = true;
				break;
			}
		}

		var ind = Util.indent(indent);
		var result = '';

		if(aliased) {
			for(var i = 0; i < this.attributes.length; i++) {
				result += ((result) ? ',\n' : '')+ind+this.attributes[i].getProjection();
			}
		}
		else {
			result = ind+this.alias+'.*';
		}

		return result;
	}

	return AbstractRelation;

})();


var Relation = (function() {

	Relation.prototype = Object.create(AbstractRelation.prototype);
	Relation.prototype.constructor = Relation;

	Relation.prototype.name;

	function Relation(name, alias) {
		AbstractRelation.call(this, alias);

		this.name = name;
	}

	Relation.prototype.getDisplay = function() { return this.name; }

	Relation.prototype.getQuery = function() {
		return this.name+' '+this.alias;
	}

	Relation.prototype.clone = function() {
		var clone = new Relation(this.name, this.alias);

		for(var i = 0; i < this.attributes.length; i++) {
			var attribute = this.attributes[i].clone();
			attribute.setRelation(clone);
			clone.addAttribute(attribute);
		}

		return clone;
	}

	return Relation;

})();


var Subquery = (function() {

	Subquery.prototype = Object.create(AbstractRelation.prototype);
	Subquery.prototype.constructor = Subquery;

	Subquery.prototype.query;

	function Subquery(query, alias) {
		AbstractRelation.call(this, alias);

		this.query = query;

		var migration = query.getAttributes();

		for(var i = 0; i < migration.length; i++) {
			this.attributes.push(migration[i].migrate(this));
		}
	}

	Subquery.prototype.getQuery = function(indent) {
		var ind = Util.indent(indent || 0);
		return '(\n'+this.query.getQuery(indent+1)+'\n'+ind+') '+this.alias;
	}

	Subquery.prototype.clone = function() {
		var clone = new Subquery(this.query, this.alias);
		clone.attributes = [];

		for(var i = 0; i < this.attributes.length; i++) {
			var attribute = this.attributes[i].clone();
			attribute.setRelation(clone);
			clone.addAttribute(attribute);
		}

		return clone;
	}

	return Subquery;

})();


var Join = (function() {

	Join.prototype.table1;
	Join.prototype.table2;

	Join.prototype.condition;

	Join.prototype.type;

	function Join(table1, table2, type, condition) {
		this.table1 = table1;
		this.table2 = table2;
		this.type = type;
		this.condition = condition;
	}

	Join.prototype.getType = function() { return this.type; }

	Join.prototype.getAttributes = function() {
		return this.table1.getAttributes().concat(this.table2.getAttributes());
	}

	Join.prototype.getProjection = function(indent) {
		return this.table1.getProjection(indent)+',\n'+this.table2.getProjection(indent);
	}

	Join.prototype.getQuery = function(indent) {
		var ind = Util.indent(indent);
		var q_t1 = this.table1.getQuery(indent+1);
		var q_t2 = this.table2.getQuery(indent+1);
		var q_c = this.condition.getQuery();
		return '(\n'+ind+'  '+q_t1+' '+this.type.getValue()+' JOIN '+q_t2+'\n'+ind+'  ON '+q_c+'\n'+ind+')';
	}

	Join.prototype.clone = function() {
		return new Join(this.table1.clone(), this.table2.clone(), this.type, this.condition);
	}

	return Join;

})();


var Attribute = (function() {

	Attribute.prototype.name;
	Attribute.prototype.alias;
	Attribute.prototype.display;

	Attribute.prototype.relation;
	Attribute.prototype.type;

	function Attribute(name, display, type, relation) {
		this.name = name;
		this.display = display;
		this.type = type;
		this.relation = relation;
	}

	Attribute.prototype.getType = function() { return this.type; }

	Attribute.prototype.getName = function() { return this.name; }

	Attribute.prototype.getAlias = function() { return this.alias; }

	Attribute.prototype.setAlias = function(alias) {
		this.alias = alias;
	}

	Attribute.prototype.getDisplay = function() { return this.display; }

	Attribute.prototype.setDisplay = function(display) {
		this.display = display;
	}

	Attribute.prototype.getRelation = function() { return this.relation; }

	Attribute.prototype.setRelation = function(relation) {
		this.relation = relation;
	}

	Attribute.prototype.getQuery = function() {
		return this.relation.getAlias()+'.['+this.name+']';
	}

	Attribute.prototype.getProjection = function() {
		return this.getQuery()+((this.alias) ? ' AS ['+this.alias+']' : '');
	}

	Attribute.prototype.clone = function() {
		var clone = new Attribute(this.name, this.display, this.type, this.relation);
		if(this.alias) {
			clone.setAlias(this.alias);
			clone.setDisplay(this.display);
		}
		return clone;
	}

	Attribute.prototype.migrate = function(relation) {
		return new Attribute(this.alias || this.name, this.display, this.type, relation);
	}

	return Attribute;

})();


var Constant = (function() {

	Constant.prototype = Object.create(Attribute.prototype);
	Constant.prototype.constructor = Constant;

	Constant.prototype.value;

	function Constant(value, type, relation) {
		Attribute.call(this, 'constant', 'constant', type, relation);

		this.value = value;
	}

	Constant.prototype.getQuery = function() {
		return this.value;
	}

	return Constant;

})();


var Aggregate = (function() {

	Aggregate.prototype.attribute;

	Aggregate.prototype.alias;
	Aggregate.prototype.display;

	Aggregate.prototype.type;

	function Aggregate(attribute, type, alias) {
		this.attribute = attribute;
		this.type = type;
		this.alias = alias;
		this.display = type.getDisplay()+'('+this.attribute.getDisplay()+')';
	}

	Aggregate.prototype.getAlias = function() { return this.alias; }

	Aggregate.prototype.getDisplay = function() { return this.display; }

	Aggregate.prototype.getProjection = function() {
		return this.type.getValue()+'('+this.attribute.getQuery()+') AS ['+this.alias+']';
	}

	Aggregate.prototype.clone = function() {
		return new Aggregate(this.attribute.clone(), this.type, this.alias);
	}

	Aggregate.prototype.migrate = function(relation) {
		var outType = this.type.getOutputType(this.attribute.getType());
		return new Attribute(this.alias, this.display, outType, relation);
	}

	return Aggregate;

})();

//arithmetic (=. !=, <, >, <=, >=)
var Comparison = (function() {

	Comparison.prototype.expr1;
	Comparison.prototype.expr2;

	Comparison.prototype.type;

	function Comparison(expr1, expr2, type) {
		this.expr1 = expr1;
		this.expr2 = expr2;
		this.type = type;
	}

	Comparison.prototype.getFirstExpression = function() { return this.expr1; }

	Comparison.prototype.getSecondExpression = function() { return this.expr2; }

	Comparison.prototype.getType = function() { return this.type; }

	Comparison.prototype.getQuery = function() {
		return this.expr1.getQuery()+' '+this.type.getValue()+' '+this.expr2.getQuery();
	}

	return Comparison;

})();

//logical connective (and)
var Connective = (function() {

	Connective.prototype.cond1;
	Connective.prototype.cond2;

	Connective.prototype.type;

	function Connective(cond1, cond2, type) {
		this.cond1 = cond1;
		this.cond2 = cond2;
		this.type = type;
	}

	Connective.prototype.getFirstCondition = function() { return this.cond1; }

	Connective.prototype.getSecondCondition = function() { return this.cond2; }

	Connective.prototype.getType = function() { return this.type; }

	Connective.prototype.getQuery = function() {
		return '('+this.cond1.getQuery()+' '+this.type.getValue()+' '+this.cond2.getQuery()+')';
	}

	return Connective;

})();


var Exists = (function() {

	Exists.prototype.query;

	Exists.prototype.type;

	function Exists(query, type) {
		this.query = query;
		this.type = type;
	}

	Exists.prototype.getQuery = function() { return this.query; }

	Exists.prototype.getType = function() { return this.type; }

	Exists.prototype.getQuery = function() {
		return this.type.getValue()+'('+this.query.getQuery()+')'
	}

	return Exists;

})();