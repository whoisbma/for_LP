This is old (and basically unfinished) code that regardless of its state, I used to query ConceptNet and generate the paths I displayed in my MFA thesis. The current API for ConceptNet is incompatible with this old code I believe. I've left in all the mess so you can see some of the process and problems I was dealing with. 

Essentially I was doing a sort of sneaky/not-truly-brute-force graph search through ConceptNet to connect two arbitrary ( but unchanging ) nodes via a minimum number of edge connections.

![definitions](http://mfadt.parsons.edu/2015/wp-content/uploads/projects/164_img_03.jpg)