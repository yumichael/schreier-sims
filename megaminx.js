/* The Megaminx
   http://en.wikipedia.org/wiki/Megaminx
   To label the faces, place the Megaminx flat on the table in front
   so that the top pentagon face points away from you.
   Flatten the top facing 6 faces into a net.
 */

 var upMiddle = "(5 23 25 27 29)(14 24 26 28 16)(4 35 38 41 30)(13 36 39 42 17)(22 37 40 43 6)";
 var upFront = "(38 58 60 62 40)(49 59 61 51 39)(25 57 68 76 41)(26 48 67 75 52)(27 37 66 74 63)";
 var upLeftSide = "(35 33 55 57 37)(34 46 55 56 48 36)(22 121 86 58 25)(21 112 77 49 24)(20 99 66 38 23)";
 var upRightSide = "(41 63 65 45 43)(42 52 64 54 44)(27 62 98 131 30)(28 51 85 120 31)(29 40 76 111 32)";
 var upBackLeft = "(0 20 22 4 2)(1 11 21 13 3)(8 124 121 35 5)(7 125 122 34 14)(6 126 123 33 23)";
 var upBackRight = "(8 6 30 32 10)(7 17 31 19 9)(2 5 43 131 128)(3 16 44 130 127)(4 29 45 129 126)";
 var rollOver = [];
 for (var i = 0; i < 66; ++i) {
 	rollOver[i] = i + 66;
 	rollOver[i + 66] = i;
 }