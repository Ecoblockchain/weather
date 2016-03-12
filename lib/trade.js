function Trade(type, amount, price) {
  this.type = type;
  this.amount = amount;
  this.price = price;
}

Trade.prototype.compare = function(price) {
  return (price - this.price) / this.price;
}
