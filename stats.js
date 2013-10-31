function Stats(arr) {
	var self = this; 
	var theArray = arr || []; 
	
	//http://en.wikipedia.org/wiki/Mean#Arithmetic_mean_.28AM.29
	self.getArithmeticMean = function() {
	    var sum = 0, length = theArray.length; 
	    for(var i=0;i<length;i++) {
	        sum += theArray[i];
	    }
	    return sum/length; 
	}
	
	//http://en.wikipedia.org/wiki/Mean#Geometric_mean_.28GM.29
	self.getGeometricMean = function() {
	    var product = 1, length = theArray.length; 
	    for(var i=0;i<length;i++) {
	        product = product * theArray[i];
	    }
        return Math.pow(product,(1/length));
	}
	
	//http://en.wikipedia.org/wiki/Mean#Harmonic_mean_.28HM.29
	self.getHarmonicMean = function() {
	    var sum = 0, length = theArray.length; 
	    for(var i=0;i<length;i++) {
	        sum += (1/theArray[i]);
	    }
	    return length/sum;
	}
	
	//http://en.wikipedia.org/wiki/Standard_deviation
	self.getStandardDeviation = function() {
	    var arithmeticMean = this.getArithmeticMean(); 
        var sum = 0, length = theArray.length; 
	    for(var i=0;i<length;i++) {
	        sum += Math.pow(theArray[i]-arithmeticMean, 2);
	    }
	    return Math.pow(sum/length, 0.5);
	}
	
	//http://en.wikipedia.org/wiki/Median
	self.getMedian = function() {
	    var length = theArray.length; 
	    var middleValueId = Math.floor(length/2);
	    var arr = theArray.sort(function(a, b){return a-b;});
	    return arr[middleValueId];
	}
	
	self.setArray = function(arr) {
		theArray = arr; 
		return self; 
	}
	
	self.getArray = function() {
		return theArray; 
	}
	
	return self; 
}
